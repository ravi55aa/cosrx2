const HttpStatus = require("../../Config/HTTPstatusCodes");
const productModel = require("../../Model/product");
const categoryModel = require("../../Model/category");
const mongoose = require("mongoose");

// listing=true  isDelete=false
const loadCategory=async(req,res)=>{
  try {
   const category = await categoryModel.find({isListed:true,isDelete:false});

    res.status(HttpStatus.OK).json({mission:"success",message:"failed",category:category});
    return;

  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server error", Error: err.message });
    return;
  }
}

const productDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "Id not found" });
      return;
    }

    const productObjectId = new mongoose.Types.ObjectId(id);

    const product = await productModel.findOne({ _id: productObjectId });

    if (!product) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "product not found" });
      return;
    }

    const availableProducts = ['available','out of stock']; 
    const related_Products = await productModel.find({
      isBlocked: false,
      category: product.category,
      status : {$in : availableProducts},
      _id:{$ne:productObjectId}
    });//undefined

    //if no related products
    // Then show related products with the
    // skin/product types

    res
      .status(HttpStatus.OK)
      .json({
        mission: "success",
        message: "product fetch successful",
        product: product,
        relatedProducts:related_Products
      });

    return;
  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server error", Error: err.message });
    return;
  }
};

const getAllProductIntoShop = async (req, res) => {
  try {
    const category = await categoryModel.find({ isListed: true, isDelete: false });

    if (!category.length) {
      return res.status(HttpStatus.NOT_FOUND).json({
        mission: "failed",
        message: "No categories available",
      });
    }

    const categoryId = category.map((ele) => new mongoose.Types.ObjectId(ele._id));
    
    const availableProducts = ['available','out of stock'];
    const products = await productModel.find(
      {
        $and : [
          {status : {$in : availableProducts}},
          {isBlocked: false},
          {category: { $in: categoryId }} 
        ]  
      }
    );

    if (!products.length) {
      return res.status(HttpStatus.OK).json({
        mission: "success",
        message: "Products fetched, but no products available",
      });
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Product fetch done",
      products: products,
    });

  } catch (err) {
    console.log("Error:", err.message);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      mission: "failed",
      message: "Server error",
      error: err.message,
    });
  }
};

const getFilteredProducts = async (req, res) => {
  
  try {
    // Fetch active inyo tthe categories
    //----------------------------------
    const category = await categoryModel.find({ isListed: true, isDelete: false });

    if (!category.length) {
      return res.status(HttpStatus.NOT_FOUND).json({
        mission: "failed",
        message: "No categories available",
        filteredProducts:[]
      });
    }

    const categoryId = category.map((ele) => new mongoose.Types.ObjectId(ele._id));

    const { search, productType, skinType, minPrice, maxPrice, sort, limit } =
      req.query;

    //For Sorting the Data based 
    // on Single condtion-------
    let sortValue = "productName"; 
    let filteringValue = 1; 

    switch (sort) {
      case "a-z":
        sortValue = "productName";
        filteringValue = 1;
        break;

      case "z-a":
        sortValue = "productName";
        filteringValue = -1;
        break;

      case "price-low-high":
        sortValue = "salePrice";
        filteringValue = 1;
        break;

      case "price-high-low":
        sortValue = "salePrice";
        filteringValue = -1;
        break;

      case "ratings":
        sortValue = "validOffer";
        filteringValue = 1;
        break;

      default:
        sortValue = "productName";
        filteringValue = 1;
        break;
    }

    //Filters data based if value are 
    // truthy value only
    //--------------------------------
    let filterConditions = {};
    if (search) {
      filterConditions.productName = new RegExp(search, "i");
    }
    if (productType) {
      filterConditions.productType = productType;
    }

    if (skinType) {
      filterConditions.skinType = skinType;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      filterConditions.salePrice = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      };
    }

    const availableProducts = ['available','out of stock'];
    const filteredProducts = await productModel
      .find(
        {...filterConditions, 
          status : {$in : availableProducts}, 
          category:{$in : categoryId },
          isBlocked:false
        })
      .sort({ [sortValue]: filteringValue })
      .populate("category");

    res.status(200).json({
      mission: "success",
      message: "Documents fetched successfully",
      filteredProducts: filteredProducts,
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      mission: "failed",
      message: "An error occurred while fetching products",
      error: error.message,
    });
  }
};

const getCategoryProducts = async (req, res) => {
  let { categoryId } = req.params;

  try {
    if (!categoryId) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "category not found" });
      return;
    }

    const ObjectId = new mongoose.Types.ObjectId(categoryId);

    const availableProducts = ['available','out of stock'];
    const products = await productModel
      .find(
          { $and: [
            { isBlocked: false },
            { category: ObjectId },
            {status : {$in : availableProducts}}
          ]}
        )
      .populate("category");

    if (products.length <= 0) {
      res
        .status(HttpStatus.OK)
        .json({
          mission: "success",
          message: "data for category not available",
        });
      return;
    }
    res
      .status(HttpStatus.OK)
      .json({ mission: "success", message: "dataFEtched", products: products });
    return;
  } catch (err) {
    console.log(err.message);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server error", error: err.message });
    return;
  }
};

const getCategoryProductsBasedOnSearch=async(req,res)=>{
  try {
      let {categoryId,searchQuery, productType, skinType, minPrice, maxPrice,sort } = req.query;
      categoryId = new mongoose.Types.ObjectId(categoryId);

      if(!categoryId){
        return;
      }

      if(!searchQuery.trim()){
        return;
      }

      searchQuery = new RegExp(searchQuery,"i");

      const queries = [productType,skinType];
      let filterObj = {};
      for(let query of queries){
        if(query.trim()) {
          filterObj.query = query;
        }
      }

      if(minPrice != undefined ||  maxPrice != undefined){
        filterObj.salePrice = {
          $gte: Number(minPrice),
          $lte: Number(maxPrice),
        };
      }

      const availableProducts = ['available','out of stock' ]; 

      let products =  await productModel.find(
        {
          ...filterObj,
          isBlocked:false,
          category:categoryId,
          productName:searchQuery,
          status:{$in:availableProducts}
        }
      ).sort(sort);
      
      res
      .status(HttpStatus.OK)
      .json({ mission: "success", message: "dataFEtched", products: products });

      return;

  } catch(err){
      console.log(err.message);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ mission: "failed", message: "server error", error: err.message });
      return;
  }
};

const getSearchData=async(req,res)=>{

  try{
    const {searchQuery} = req.query;
  
    const regSearchQuery = new RegExp(searchQuery,"i");
  
    const availableProducts = ['available','out of stock']; 
    
    const products = await productModel.find(
        {
          $and : [
          { isBlocked:false }, 
          {status:{$in:availableProducts}}, 
          {productName:regSearchQuery }
        ]
      });

      res
      .status(HttpStatus.OK)
      .json({mission:"success",message:"Product search done",products:products});

      return;
  
    } catch(err){
    res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json({mission:"failed",message:'server error',error:err.message})
    
    return;
  }
};

module.exports = {
  loadCategory,
  getSearchData,
  productDetails,
  getFilteredProducts,
  getCategoryProducts,
  getAllProductIntoShop,
  getCategoryProductsBasedOnSearch,
};
