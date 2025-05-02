import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosBaseUrl from "$/axios";
import { BounceLoader } from "react-spinners";

const GoogleAuthRedirect = () => {
  const navigate = useNavigate();

  const override= {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  useEffect(() => {
    const useParams = new URLSearchParams(window.location.search);
    let googleId = "";

    if (!Array.from(useParams).length) {
      googleId = JSON.parse(localStorage.getItem("googleId"));
    }

    if (useParams.get("token") || googleId) {
      const token = useParams.get("token") || JSON.parse(localStorage.getItem("token"));

      if (useParams.get("token")) {
        localStorage.setItem("googleId", JSON.stringify(useParams.get("id")));
        localStorage.setItem("googleUserProfilePicture", JSON.stringify(useParams.get("photo")));

        const payload = {
          name: useParams.get("name"),
          email: useParams.get("email"),
          id: useParams.get("id"),
          photo: useParams.get("photo"),
        };

        // Store user info and token before redirecting
        localStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("user", JSON.stringify(payload));

        fetchUserProfile(token, payload);
      }

    navigate("/user/homepage");
    return;
    }

    // Fallback for normal login
    const user = JSON.parse(localStorage.getItem("user"));
    const token = JSON.parse(localStorage.getItem("token"));

    if (!token) {
      navigate("/user/login");
      return;
    }

    if (user?._id) {
      axiosBaseUrl.get(`/user/homepage/fetchData/${user._id}`)
        .then((res) => {
          if (!res.data?.error) {
            localStorage.setItem("token", JSON.stringify(res.data.token));
          }
        })
        .catch((err) => console.log("Fetch error:", err.message));
    }

  }, []);


  function fetchUserProfile(token,payload){
      
    const header = { 
      headers : {
        Authorization : `Bearer ${token}`
      }
    }

    axiosBaseUrl.post("/auth/profile",payload,header)
    .then((res)=>{
      const result=res.data;

    }).catch((err)=>{
      console.log(err.message);
      return;
    });
}

  return <div className="h-[100vh] w-full bg-black">
            <div className="flex !h-[100%] justify-center items-center">
                    <BounceLoader
                        color="#c2ffa9"
                        loading={true}
                        cssOverride={override}
                        size={50}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        speedMultiplier={2}
                    />
            </div>
        </div>;
};

export default GoogleAuthRedirect;
