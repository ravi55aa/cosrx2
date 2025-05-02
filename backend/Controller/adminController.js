const HttpStatus = require("../Config/HTTPstatusCodes");
const mongoose = require("mongoose");

const userModel = require("../Model/user");

const categoryModel = require("../Model/category");

const productModel = require("../Model/product");
const { validateProduct,uploadTheProductImages } = require("../utils/validator.js");

const cloudinary = require("../Config/cloudinary.js");

const adminId = {
  email: "adm321@gm",
  password: "1121",
};

const getLogin = async (req, res) => {
  res
    .status(200)
    .json({ mission: "success", message: "admin dashboard successful" });
  return;
};

const postLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ mission: "failed", message: "one of the Credential is null" });
    return;
  }

  if (email !== adminId.email) {
    res.status(409).json({ mission: "failed", message: "Email is not valid" });
    return;
  }

  if (password !== adminId.password) {
    res
      .status(409)
      .json({ mission: "failed", message: "Password is not valid" });
    return;
  }

  res.status(200).json({
    mission: "success",
    message: "admin successfully log-in",
    admin: adminId.email,
  });
  return;
};

//user side----
const loadUsers = async (req, res) => {
  try {
    const users = await userModel.find();

    if (users.length <= 0) {
      res.status(HttpStatus.CONFLICT).json({
        mission: "success",
        message: "No data in the database",
        user: users,
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "data fetch successful",
      users: users,
    });
    return;
  } catch (err) {
    console.log("server error");

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      mission: "failed",
      message: "internal server error",
      Error: err.message,
    });
    return;
  }
};

const handleBlocking = async (req, res) => {
  try {
    const { id, blockingValue } = req.body;
    if (!id) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "id not found" });
      return;
    }

    if (blockingValue === undefined || blockingValue === null) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "blocking value is null", });
      return;
    }

    //if blockedUser== true ? false : true;
    //This is forcefully block the user 
    //from the login
    //--------------------------------------
    const blockOrUnblock = blockingValue ? false : true;

    const userID = new mongoose.Types.ObjectId(id);

    const findAndUpdate = await userModel.findOneAndUpdate(
      { _id: userID },
      { isBlocked: blockOrUnblock },
      { upsert: false, new: true }
    );

    res.status(HttpStatus.OK).json({
      mission: "success",
      isBlocked:blockOrUnblock,
      message: "block handled successfully",
      updatedUser: findAndUpdate,
      userId: id
    });

  } catch (err) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      mission: "failed",
      message: "internal server error",
      Error: err.message,
    });
    return;
  }
};

const handleSearchInput = async (req, res) => {
  try {
    const { searchTerm } = req.body;

    const regExpOFsearchInput = new RegExp(searchTerm, "i");

    const searchedUsers = await userModel
      .find({
        $or: [
          { email: regExpOFsearchInput },
          { firstName: regExpOFsearchInput },
          { LastName: regExpOFsearchInput },
        ],
      })
      .sort({ createdAt: 1 });

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Users found",
      users: searchedUsers,
    });
  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });

    return;
  }
};

//category side----
const loadCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      categoryModel.find({isDelete:false}).skip(skip).limit(limit),
      categoryModel.find({isDelete:false}).countDocuments(),
    ]);

    if (categories.length <= 0) {
      res.status(HttpStatus.OK).json({
        mission: "success",
        message: "No categories found",
        categories: categories,
        total: total,
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Categories fetched successfully",
      categories: categories,
      total: total,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error" });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, description, status, offer } = req.body; 
    
    if (!name || !description || !status) {

      res
      .status(HttpStatus.CONFLICT)
      .json({ mission: "success", message: "Some Field is null" });
      return;
    }

    //here iam checking does the category 
    // is deleted or not delted in the mopngodb
    const categoryExist = await categoryModel.findOne({name:name});


    if(categoryExist && Object?.keys(categoryExist)?.length > 0){
      if(categoryExist.isDelete == false){
        console.log(3)
        res
        .status(HttpStatus.OK)
        .json({ mission: "success", message: "Category already exist",alreadyExist:true });
        
        return;
        
      } else { 
        
        res.status(HttpStatus.OK).json({
          mission: "success",
          exist : "true",
          message: "category already exist in the db",
        });
        
        return;
      }
    }
    
    const cloudinaryImage = await cloudinary.uploader.upload(
      req.file.path, 
      { 
        folder:"ecommerce/products",
        use_filename: true, 
        unique_filename: true,
        overwrite:false
      }
    );
    
    const newCategory = await new categoryModel({
      name,
      description,
      categoryOffer: offer,
      isListed: status,
      banner:cloudinaryImage?.secure_url,
    }).save();   
    
    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "category added successfully",
      newCategory: newCategory,
    });
    
    return;

  } catch (err) {
    console.error(err.message);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error",error:err.message });
    return;
  }
};

const readdCategory = async(req,res)=>{

  try{
      const {categoryName} = req.query;
      if(!categoryName){
        res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"category not found"});
        return;
      }

      const category = await categoryModel.findOne({name:categoryName});

      if(category?.isDelete){
        const reAddedCategory = await categoryModel.findOneAndUpdate({name:categoryName},{isDelete:false},{new:true});

        res.status(HttpStatus.OK).json({
          mission: "success",
          message: "category re-added successfully",
          reAddedCat : reAddedCategory
        });

        return;
      }

      res.status(HttpStatus.OK).json({
        mission: "success",
        message: "category re-added successfully",
      });

      return;

  } catch(err){
    console.log(err.message);
    res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json({ mission: "failed", message: "Server Error",error:err.message });
    return;
  }

};

const handleSearchInputForCategory = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const regExpOFsearchInput = new RegExp(searchTerm, "i");

    const [categories, total] = await Promise.all([
      categoryModel
        .find({ name: regExpOFsearchInput,isDelete:false })
        .skip(skip)
        .limit(limit),
      categoryModel.countDocuments({$and : [ {name: regExpOFsearchInput} , {isDelete:false}] }),
    ]);

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Categories found",
      categories: categories,
      total: total,
    });
  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });
  }
};

const handleListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "id is null" });

      return;
    }
    const { listing } = req.body;

    // const cateId = new mongoose.Types.ObjectId(id);
    const toggleListing = !listing;
    

    const category = await categoryModel.findByIdAndUpdate(
      id,
      { isListed : toggleListing },
      { new: true }
    );

    if (!category) { 
      return res
        .status(404)
        .json({ mission: "failed", message: "Category not found" });
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "updated Successfully",
      category: category,
    });
    return;
  } catch (err) {
    console.log(err.message);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });

    return;
  }
};

const handleDelete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "id is null" });

      return;
    }

    const category = await categoryModel.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );
    //isDelete =  true;

    if (!category) {
      return res.status(HttpStatus.NOT_FOUND).json({
        mission: "failed",
        message: "Category not found",
      });
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "successfully soft deleted Item",
      category: category,
    });
    return;
  } catch (err) {
    console.log(err.message);
    res
      .status(HttpStatus.OK)
      .json({ mission: "failed", message: "Server Error", Error: err.message });

    return;
  }
};

const handleEdit = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "id is null" });
      return;
    }

    const { name, description, offer, status } = req.body;
    
    const idToObjectId= new mongoose.Types.ObjectId(id);

    const categoryExist = await categoryModel.findOne({name:name, _id :{$ne : idToObjectId } });

    if(categoryExist && Object?.keys(categoryExist)?.length > 0){
      if(categoryExist.isDelete == false && name){
        res
        .status(HttpStatus.OK)
        .json({ mission: "success", message: "Category already exist",alreadyExist:true });
        return;
        
      } else { 
        
        res.status(HttpStatus.OK).json({
          mission: "success",
          exist : "true",
          message: "category already exist in the db",
        });
        
        return;
      }
    }

    let result = "";
    if(req.file){
      result = await cloudinary?.uploader?.upload(req.file.path,{
                                  use_filename:true,
                                  unique_filename:true,
                                  overwrite:true,
            });
          }

    const category = await categoryModel?.findByIdAndUpdate(
      id,
      {
        name,
        description,
        categoryOffer: offer,
        isListed: status,
        banner:result.secure_url
      },

      { new: true }
    );

    if (!category) {
      return res.status(HttpStatus.NOT_FOUND).json({
        mission: "failed",
        message: "Category not found",
      });
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Category updated successfully",
      category: category,
    });
    return;

  } catch (err) {
    console.log(err.message);
    res
      .status(HttpStatus.OK)
      .json({ mission: "failed", message: "Server Error", Error: err.message });

    return;
  }
};

//Product Side:
const loadProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productModel.find({ isBlocked: false }).populate("category").skip(skip).limit(limit),
      productModel.countDocuments(
        {$and : [ 
          {isBlocked: false},
          {status : {$ne : "Discontinued"}}
        ]
      }), 
    ]);

    if (products.length <= 0) {
      res.status(HttpStatus.OK).json({
        mission: "success",
        message: "Not found the products..",
        products: products,
        total: total,
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "products fetched successfully",
      products: products,
      total: total,
    });
    return;
  } catch (err) {
    console.error(err.message);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error" });
    return;
  }
};

//Here iam checking the product exist based on;
//some condition => [productName, weight, salePrice];
const checkProductExist = async (req, res) => {
  try {
    const { productName, weight, salePrice } = req.body;
    const product = await productModel.findOne({
      productName,
      weight,
      salePrice,
    }).select("isBlocked _id");

    if (product) {
      res.status(HttpStatus.OK).json({
        mission: "success",
        exists: true,
        isBlocked: product.isBlocked,
        productId: product._id,
      });
    } else {
      res.status(HttpStatus.OK).json({
        mission: "success",
        exists: false,
      });
    }
  } catch (err) {
    console.error(err.message);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });
  }
};

const addProducts = async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      productFullDescription,
      productCategory,
      skinType,
      productType,
      regularPrice,
      salePrice,
      quantity,
      isBlocked,
      status,
      weight,
      validOffer,
      productOffer
    } = req.body;
    console.log("salePrice",salePrice,"regularPrice",regularPrice);

    //validation error
    //------------------
    const errors = validateProduct(req.body);
    
    if (Object.keys(errors).length > 0) {
      res
      .status(HttpStatus.OK)
      .json({
        mission: "failed",
        message: "validation error",
        error: errors,
      });
      return;
    }
  
    //uploading into cloudinary error ...
    //---------------------------
    const uploaded_images = await uploadTheProductImages(req.files);
    
    if (!Array.isArray(uploaded_images) || uploaded_images.some(img => typeof img !== 'string')) {
      return res.status(400).json({ images: uploaded_images, error: "Image upload failed." });
    }
    
    //add a check that does the product already exist in the database
    //based on the name=weight=price;
    
    const productAlreadyExist = await productModel.find({ $and:[
      {productName:productName},
      {weight:weight},
      {salePrice:salePrice},
    ]});
    
    if(productAlreadyExist.length > 0){
      res
        .status(HttpStatus.OK)
        .json({mission:'success',"message":"Product already Exists",
              error:"product already exist, Do you want add it.",
              productId:productAlreadyExist._id
            }
          );
      return;
    }

    const product = new productModel({
      productName,
      description: productDescription,
      fullDescription: productFullDescription,
      category: productCategory,
      skinType,
      productType,
      regularPrice: parseFloat(regularPrice || 0),
      salePrice: parseFloat(salePrice || 0),
      productOffer: parseFloat(productOffer).toFixed(2),
      validOffer: parseFloat(validOffer).toFixed(2),
      quantity,
      isBlocked,
      status,
      weight,
      productImage: uploaded_images,
    });

    await product.save();

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Product added successfully",
      newProduct: product,
    });

    return;
  } catch (err) {
    console.error(err.message);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });

    return;
  }
};

const reAddProducts = async (req,res)=>{
  try {
    const {id} = req.params;
  
    const product = await productModel.findByIdAndUpdate(id,{isBlocked:false},{new:true});
    console.log(product);

    if(!product || product?.length <= 0 || Object?.keys(product).length <=0 ) {
      
      res.status(HttpStatus.NOT_FOUND)
      .json({ mission: "failed", message: "Product not found" });
      return;
    }

    res.status(HttpStatus.OK)
      .json({ mission: "success", message: "Product added successfully" });
    return;

  } catch(err){
    console.error(err.message);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });

    return;
  }
}

const editProducts = async(req,res)=>{
  try {

    const {id} =req.params;

    let {
      productName,
      productDescription,
      productFullDescription,
      productCategory,
      skinType,
      productType,
      regularPrice,
      salePrice,
      quantity,
      isBlocked,
      status,
      images,
      productOffer,
      validOffer
    } = req.body;

    console.log("the data i have recieved",req.body);
    //validation error
    const errors = validateProduct(req.body);
    if (Object.keys(errors).length > 0) {
      res
      .status(HttpStatus.OK)
      .json({
        mission: "failed",
        message: errors,
        validtionError: errors,
      });
      return;
    }
    
    //uploading into cloudinary error ...

      const uploaded_images = await uploadTheProductImages(req.files);
  
      if (!Array.isArray(uploaded_images) || uploaded_images.some(img => typeof img !== 'string')) {
        return res.status(400).json({ images: uploaded_images, error: "Image upload failed." });
      }
    

    const categoryId = new mongoose.Types.ObjectId(productCategory);

    const foundCategory = await categoryModel.findById(categoryId);
    if (Object.keys(foundCategory).length <= 0) {
      res
        .status(HttpStatus.NOT_FOUND)   
        .json({
          mission: "failed",
          message: "category is not found",
          category: productCategory,
        });
      return;
    }

    if(quantity > 0){
      status ="available"
    }

    const product = await productModel.findByIdAndUpdate(id,{
      productName,
      description: productDescription,
      fullDescription: productFullDescription,
      category: foundCategory._id,
      skinType,
      productType,
      regularPrice: parseFloat(regularPrice || 0),
      salePrice: parseFloat(salePrice || 0),
      productOffer: parseFloat(productOffer).toFixed(2),
      validOffer: parseFloat(validOffer).toFixed(2),
      quantity,
      isBlocked,
      status,
      productImage: req.files.length > 0 ? uploaded_images:images ,
    },{new:true});

    if(!product){ //if not updated
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"product not updated","product":product});
      return;
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Product added successfully",
      product: product,
    });

    return;
  } catch (err) {
    console.error(err.message);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });

    return;
  }
}

const deleteProducts=async (req,res) =>{
    try {
      const { id } = req.params;
  
      if (!id) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ mission: "failed", message: "id is null" });
  
        return;
      }
  
      const product = await productModel.findByIdAndUpdate(
        id,
        { isBlocked: true },
        { new: true }
      );
      //isDelete =  true;
  
      if (!product) {
        return res.status(HttpStatus.NOT_FOUND).json({
          mission: "failed",
          message: "Product not found",
        });
      }
  
      res.status(HttpStatus.OK).json({
        mission: "success",
        message: "successfully soft deleted Item",
        product: product,
      });
      return;
    } catch (err) {
      console.log(err.message);
      res
        .status(HttpStatus.OK)
        .json({ mission: "failed", message: "Server Error", Error: err.message });
  
      return;
    }
};

const listingProduct=async(req,res)=>{

  try {
    const { id } = req.params;
    const {listing} = req.body; 

    if (!id) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "product id is null" });

      return;
    }

    let updatedProduct = [];

    if(listing == "Discontinued"){
       updatedProduct = await productModel.findByIdAndUpdate(
        id,
        { status : "available" },
        { new: true }
      );
    } else {
       updatedProduct = await productModel.findByIdAndUpdate(
        id,
        { status : "Discontinued" },
        { new: true }
      );
    }

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ mission: "failed", message: "Category not found" });
    }

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Status updated Successfully",
      updatedProduct: updatedProduct,
    });

    return;

  } catch (err) {
    console.log(err.message);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });

    return;
  }

}

const searchProducts = async (req, res) => {
  try {
    const { searchText } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const regExpOFsearchInput = new RegExp(searchText, "i");

    const [searchResult, total] = await Promise.all([
      productModel
        .find({ $and: [{ isBlocked: false }, { productName: regExpOFsearchInput }] })
        .skip(skip)
        .limit(limit),
      productModel.countDocuments({
        $and: [{ isBlocked: false }, { productName: regExpOFsearchInput }],
      }),
    ]);

    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "Products found",
      products: searchResult,
      total: total,
    });
  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "Server Error", error: err.message });
    return;
  }
};

module.exports = {
  getLogin,
  postLogin,
  loadUsers,
  handleBlocking,
  handleSearchInput,

  loadCategory,
  addCategory,
  readdCategory,
  handleSearchInputForCategory,
  handleListing,
  handleDelete,
  handleEdit,

  loadProducts,
  addProducts,
  checkProductExist,
  reAddProducts,
  editProducts,
  deleteProducts,
  listingProduct,
  searchProducts,
};
