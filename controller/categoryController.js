const Category = require("../model/category");

async function addCategory(req, res) {
   try {

      const { categoryName, structure, totalQuestions } = req.body;
      const category = await Category.create({ categoryName, structure, totalQuestions });

      res.status(200).json({
         message: "Success",
         category
      })
   }
   catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in adding category", error: error.errors });
   }
}

async function getAll(req, res) {
   try {
      const categories = await Category.find().lean().sort({ categoryName: 1 });
      if (categories.length !== 0)
         res.status(200).json({ categories });
      else
         res.status(201).json({ message: "No Data" })
   } catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in fetching all data", error: error.errors });
   }
}

// async function modifyTotalQuestions(req, res) {
//    try {
//       const { categoryName, increment } = req.body;
//       console.log(req.body);
//       const category = await Category.findOne({ categoryName });
//       console.log(category.totalQuestions);
//       if (category) {
//          if (increment) {
//             const newCategory = await Category.findByIdAndUpdate({ _id: category._id }, { totalQuestions: category.totalQuestions === undefined || category.totalQuestions === null ? 1 : (category.totalQuestions + 1) }, { new: true })
//             res.status(200).json({ message: "Updated Total Questions Successfully", category: newCategory });
//          }
//          else {
//             const newCategory = await Category.findByIdAndUpdate({ _id: category._id }, { totalQuestions: (category.totalQuestions - 1) }, { new: true })
//             res.status(200).json({ message: "Updated Total Questions Successfully", category: newCategory });
//          }
//       }
//       else {
//          console.log("no category found");
//       }
//    } catch (error) {
//       console.log(error);
//       res.status(404).json({ message: "Fail in modifying category", error: error.errors });
//    }
// }

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
         res.status(200).json({ message: "Modified Successfully", category: modifiedCategory });
      }
   } catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in modifying category", error: error.errors });
   }
}

async function deleteCategory(req, res) {
   try {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);
      res.status(200).json({ message: "Deleted Successfully", category });
   } catch (error) {
      console.log(error.errors);
      res.status(404).json({ message: "Fail in deleting category", error: error.errors });
   }
}

module.exports = { addCategory, deleteCategory, modifyCategory, getAll }