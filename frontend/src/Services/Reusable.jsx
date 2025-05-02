export const getUserId=()=>{
    const user = JSON.parse(localStorage.getItem("user"));
    
    const result = {field:"",id:""};
    
    if(user){
        if(user?._id){
            result.field = "_id";
            result.id = user?._id;
        } else {
            result.field = "googleId";
            result.id = user?.id;
        }
    }
    return result;
}






