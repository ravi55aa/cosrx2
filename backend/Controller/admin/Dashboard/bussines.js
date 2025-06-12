const orderItemsModel =  require("../../../Model/orderItem"); 

const productModel = require("../../../Model/product");

const handleGetAllItems=async()=>{
    const orderedItemsWithCount = await orderItemsModel.aggregate([
                {$group:
                    {
                        _id:"$name",
                        totalReturns: { $sum: 1 } 
                    }}
        ]);

        return orderedItemsWithCount
}

const handleGetTopCategories = async (itemsArray) => {

    const flatItems = itemsArray.flat();

    const allCategoryArray = await Promise.all(
        flatItems.map(async (pro) =>
            await productModel.findById(pro.product).populate("category")
        )
    );

    let categories = {};

    allCategoryArray.forEach((product) => {
        if (product?.category?.name) {
            const categoryName = product.category.name;
            categories[categoryName] = (categories[categoryName] || 0) + 1;
        }
    });

    return categories;
};




module.exports = {
    handleGetAllItems,
    handleGetTopCategories
}