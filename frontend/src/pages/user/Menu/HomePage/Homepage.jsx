import { useCallback, useEffect, useState } from "react"; // Added useState for hamburger menu
import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import Slider from "react-slick";
import Footer from "@/components/Footer";
import HeaderSection from "@/components/HeaderSection";

import {FaSearch} from "react-icons/fa"

import {useNavigate , Link} from "react-router-dom"
import {useSelector, useDispatch} from "react-redux";
import axiosBaseUrl from "$/axios";
import { loadData } from "#/Homepage/loadHomePage"; 

// Dummy images for products
const dummyProductImage = "https://via.placeholder.com/200x300?text=Product+Image";


const Home = () => {


  let [searchQuery,setSearchQuery] = useState(""); 
  let [searchProducts,setSearchProducts] = useState([]); 
  // const [homePageData,setHomePageData] = useState([]);
  const homePageData = useSelector((state)=>state.homePage);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("homePageData",homePageData[0]);

  //For Fetch User Data;
  useEffect(()=>{
    localStorage.setItem("userInHome",JSON.stringify(true));

    //google auth
    let googleId = JSON.parse(localStorage.getItem("googleId"));

    if(googleId){
      console.log("google authe done")
      return;
    }


    //Normal Registration
    const userId = JSON.parse(window.localStorage.getItem("user"))?._id;
    const token = JSON.parse(window.localStorage.getItem("token"));
    
    if(!token){
      navigate("/user/login");
      return;
    }

    if(userId){
      axiosBaseUrl.get(`/user/homepage/fetchData/${userId}`)
    .then((res)=>{
        console.log("2");
        const result = res.data;

        if(result.hasOwnProperty("error")){
          console.log("the error",result?.error);
          return;
        }

        //store token and userData in the localStorage:
        window.localStorage.setItem("token",JSON.stringify(result.token));

        return;
        //token saved successfully;

      }).catch((err)=>{
        console.log(err.message);
        return;
      })
    }

  }, []);

  //fetch 10 random products:
  useEffect(()=>{
    //
    axiosBaseUrl.get("/authorised/homepage")
    .then((res)=>{
      
      if(res.status !== 200){
        console.log(res.error || "somethieng weng wrong" )
        return; 
      }

      const result = res.data;
      
      dispatch(loadData(result.products));
      
      return;
    
    }).catch((err)=>{
      console.log(err.message);
      return;
    });
  },[]);

  // Initialize AOS and GSAP animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    gsap.fromTo(
      ".hero-heading",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  //handleSearchQueryFetching;
  useEffect(()=>{

    const fetchSearchData=async()=>{

      const response =  await axiosBaseUrl.get("/productDetails/searchData",{
          params: { 
            "searchQuery":searchQuery.trim()
          }
      });

      const result = await response.data;
      setSearchProducts(result.products);
      return;

    }
    fetchSearchData();
  },[searchQuery]);

  // Carousel settings for react-slick
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  
  const handleSearch = useCallback((event)=>{
    setTimeout(()=>{
      setSearchQuery(event.target.value.trim());
    },1000);

  },[searchQuery]); 


  return (
    <div className="bg-gray-50">
      {/* Header */}
      <HeaderSection/>

      {/* Hero Section */}
      <section className="relative bg-teal-100 py-16">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center px-4">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2
              className="hero-heading text-4xl font-bold text-textLight"
              data-aos="fade-up"
            >
              LATEST SKINCARE COLLECTION
            </h2>
            <p
              className="mt-4 text-textLight max-w-md mx-auto lg:mx-0"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              The essence of beauty in a perfect drop for your skin, always there for you.
            </p>
            <div className="flex items-end gap-2 ">
                <Link target="_self" to="/user/shop">
                <motion.button
                  className="mt-6 py-2 px-6 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Shop Now
                </motion.button>
                </Link>
                <div className="flex items-center relative h-1/2 !w-1/2 border border-[#009689] rounded-md p-3 shadow-sm">
                    <FaSearch className="text-gray-400 mr-2" />
                    <input
                      type="search"
                      onChange={handleSearch}
                      placeholder="Search products..."
                      className="w-full outline-none !bg-transparent text-textLight text-sm"
                      />
                  <div id="search" className={`absolute overflow-auto left-0 text-[#ffffff] 
                  top-[6.8vh] rounded-2xl px-2 py-4 bg-[#006f86] w-full 
                    z-30 ${searchQuery.trim() ? "block h-[150px]":"hidden h-a uto"} `}>
                        { searchProducts?.length > 0 
                        ?
                          searchProducts?.map((ele, id) => (
                            <>
                              <Link key={ele.productName+id} className="text-start mb-1 underline underline-offset-3" to={`/user/productDetails/${ele?._id}`}>
                                {id+1}. {ele?.productName?.slice(0,30)} ..
                              </Link>
                              <br />
                            </>
                        ))
                      :
                      <span className="!text-center text-[#b4daff]">---------No data---------</span>
                      }
                      
                  </div>
                </div>
            </div>

          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0">
            <h1
              className="text-6xl font-bold text-textLight text-center"
              data-aos="zoom-in"
            >
              COSRX
            </h1>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 text-center">
          <div data-aos="fade-up">
            <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-textLight">
              Free Shipping
            </h3>
            <p className="mt-2 text-textLight">
              Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et.
            </p>
          </div>
          <div data-aos="fade-up" data-aos-delay="100">
            <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-textLight">
              24/7 Support
            </h3>
            <p className="mt-2 text-textLight">
              Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et.
            </p>
          </div>
          <div data-aos="fade-up" data-aos-delay="200">
            <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-1.104 0-2 .896-2 2v3h4v-3c0-1.104-.896-2-2-2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-textLight">
              Secure Payment
            </h3>
            <p className="mt-2 text-textLight">
              Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et.
            </p>
          </div>
        </div>
      </section>

      {/* Banner Section with Image Grid */}
      <section className="py-2 bg-gray-50 "> {/* Set height to 90vh and allow scrolling */}
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className="text-3xl font-bold text-textLight text-center"
            data-aos="fade-up"
          >
            Explore Our Products
          </h2>
          <p
            className="mt-2 text-textLight text-center max-w-md mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Discover the best skincare products tailored for your needs.
          </p>

          <div className={`mt-8 grid gap-4 
            ${homePageData[1]?.length <=0 ? "!h-[20px] grid-cols-1" : "!h-[90vh] grid-cols-2 md:grid-cols-4"  }`}>
          { homePageData[1]?.length <=0 
          ?
            (<h2 className="text-center !w-[100%] text-green-500">Not Data found</h2>)
          :
            (
              homePageData[0]?.map((ele, index) => ( 
                <motion.div
                  key={ele._id}
                  className={`relative overflow-hidden flex justify-center rounded-lg shadow-md ${
                    index % 5 === 0 ? "col-span-2 row-span-2" : ""
                  } ${index % 3 === 0 ? "col-span-1 row-span-1" : ""}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  
                  {(["deconstruct", "Oshea", "BELLAVITA"].some(keyword => ele.productName.includes(keyword)))
                  ? (
                      <img
                      src={ele?.productImage[0]}
                      alt={ele.productName}
                      width="20%"
                      className=" object-center !h-[100%] transition-transform duration-300 transform hover:scale-105"
                    />
                  )
                  :
                    (<img
                      src={ele?.productImage[0]}
                      alt={ele.productName}
                      width="55%"
                      className=" object-center !h-[100%] transition-transform duration-300 transform hover:scale-105"
                    />)}
                  
                  {/* Hover Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white opacity-0 transition-opacity duration-300"
                    whileHover={{ opacity: 1 }}
                  >
                    <h3 className="text-lg font-semibold text-center">
                      {ele.productName?.length> 35 
                      ? ele.productName?.slice(0,35)+"..."
                      : ele.productName }
                      </h3>
                    <p className="mt-2">₹{ele.salePrice}.00</p>
    
                    <Link to={`/user/productDetails/${ele._id}`}  target="_parent">
                      <motion.button
                        className="mt-4 py-2 px-4 bg-teal-600 text-white rounded-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Product
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Bestsellers Section with Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className="text-3xl font-bold text-textLight text-center"
            data-aos="fade-up"
          >
            Our Bestsellers
          </h2>
          <p
            className="mt-2 text-textLight text-center max-w-md mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            These are our newest beauty products, selected by client’s dark skin-loving.
          </p>

          <div className="mt-8" data-aos="fade-up" data-aos-delay="200">
            {homePageData[1]?.length <=0 
            ? 
              (<p className="text-center text-green-500">No data found in the background</p> )
            :
              ( <Slider {...carouselSettings}>
                {homePageData[1]?.map((product,index) => (
                  <div key={index} className="p-4">
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                      <img
                        src={product.productImage[0]}
                        alt={product.productName.split(" ")[0]}
                        className="w-full h-48 object-contain mx-auto"
                      />
                      <h3 className="mt-4 text-lg font-semibold text-textLight">
                        {product.productName.split(" ")[0]}
                      </h3>
                      <p className="mt-2 text-teal-600 font-bold">
                        ₹{product.salePrice}/-
                      </p>
                      <Link to={`/user/productDetails/${product._id}`} target="_self">
                        <motion.button
                          className="mt-4 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Shop {/* later make it to the "Add to cart" */}
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                ))}
              </Slider>)
              }
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Home;