const Category = require("../model/category");
const redisClient = require("../cache/redisClient");

// 60 = 1 minute;
// 60 * 60 = 1 hour;
// 60 * 60 * 8 = 8 hours;

const CACHE_EXPIRY = 60 * 60 * 8;

async function addCategory(req, res) {
   try {

      const { categoryName, structure, totalQuestions } = req.body;
      const category = await Category.create({ categoryName, structure, totalQuestions });

      await redisClient.del(`getAllCategories`);

      res.status(200).json({
         message: "Success",
         category
      })
   }
   catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in adding category", error });
   }
}

async function getAll(req, res) {
   try {
      const cachedCategory = await redisClient.get(`getAllCategories`);
      if (cachedCategory) {
         console.log("Cache Hit: Get All Categories");
         if (JSON.parse(cachedCategory).length === 0)
            return res.status(201).json({ message: "No Data" });
         return res.status(200).json({ categories: JSON.parse(cachedCategory) });
      }
      console.log("Cache Miss: Get All Categories");

      const categories = await Category.find().lean().sort({ categoryName: 1 });

      if (!categories)
         return res.status(201).json({ message: "No Data" })

      await redisClient.setEx(`getAllCategories`, CACHE_EXPIRY, JSON.stringify(categories));

      res.status(200).json({ categories });
   } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in fetching all data", error});
   }
}

async function modifyCategory(req, res) {
   try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
         res.status(404).json({ message: "Category not found" })
      }
      else {
         const { categoryName, structure, totalQuestions } = req.body;
         const modifiedCategory = await Category.findByIdAndUpdate({ _id: id }, { categoryName, structure, totalQuestions }, { new: true });
         await redisClient.del(`getAllCategories`);
         res.status(200).json({ message: "Modified Successfully", category: modifiedCategory });
      }
   } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in modifying category", error });
   }
}

async function deleteCategory(req, res) {
   try {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);
      await redisClient.del(`getAllCategories`);
      res.status(200).json({ message: "Deleted Successfully", category });
   } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Fail in deleting category", error });
   }
}

module.exports = { addCategory, deleteCategory, modifyCategory, getAll }