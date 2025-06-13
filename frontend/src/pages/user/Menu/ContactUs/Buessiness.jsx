import {toast} from "react-toastify";

export const handleChanges=(e,setFormFields)=>{
    const {name,value} = e.target;
    setFormFields((prev)=>({...prev,[name]:value}));
    return;
}

export const handleSubmit = (e,setFormFields) => {
        e.preventDefault();
        
        setFormFields({
            name:"",
            email:"",
            message:""
        });
        
        toast.success("Form submitted!");
};