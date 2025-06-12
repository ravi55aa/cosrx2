import React,{useState} from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import headerBackground from "@/assets/aboutUs/banner4.avif";
import contactImage from "@/assets/aboutUs/profile.jpeg"; 
import { handleChanges,handleSubmit } from "./Buessiness";

const ContactUs = () => {

    const [formFields,setFormFields]= useState({name:"",email:"",message:""});

    React.useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    return (
        <div className="bg-gray-50 text-textLight min-h-screen">
        <HeaderSection />

        {/* Hero Section */}
        <section
            className="relative bg-cover bg-center py-32"
            style={{ backgroundImage: `url(${headerBackground})` }}
        >
            <div className="absolute opacity-80"></div>
            <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-6xl font-bold text-start ms-20">Contact Us</h3>
            </div>
        </section>

        {/* Contact Form Section */}
        <section className="max-w-7xl mx-auto px-4 py-16 bg-white">
            <div className="text-center" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-textLight mb-4">Get in Touch</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                We’d love to hear from you! Fill out the form below, and we’ll get back to you as soon as possible.
            </p>
            <form onSubmit={(e)=>handleSubmit(e,setFormFields)} className="max-w-xl mx-auto">
                <div className="mb-4">
                <label htmlFor="name" className="block text-gray-600 mb-2">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={formFields.name}
                    onChange={(e)=>handleChanges(e,setFormFields)}
                    name="name"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Your Name"
                    required
                />
                </div>
                <div className="mb-4">
                <label htmlFor="email" className="block text-gray-600 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    value={formFields.email}
                    onChange={(e)=>handleChanges(e,setFormFields)}
                    name="email"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Your Email"
                    required
                />
                </div>
                <div className="mb-4">
                <label htmlFor="message" className="block text-gray-600 mb-2">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formFields.message}
                    onChange={(e)=>handleChanges(e,setFormFields)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                    rows="5"
                    placeholder="Your Message"
                    required
                ></textarea>
                </div>
                <button
                type="submit"
                className="inline-block px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                Send Message
                </button>
            </form>
            </div>
        </section>

        {/* Contact Information Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-aos="fade-up">
            <div className="text-center">
                <FaEnvelope className="text-teal-600 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Email Us</h3>
                <p className="text-gray-600">cosrx12@example.com</p>
            </div>
            <div className="text-center">
                <FaPhone className="text-teal-600 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Call Us</h3>
                <p className="text-gray-600">+1 (123) 776-3890</p>
            </div>
            <div className="text-center">
                <FaMapMarkerAlt className="text-teal-600 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Visit Us</h3>
                <p className="text-gray-600">123 Main Street, Kerala, Kakkanchery</p>
            </div>
            </div>
        </section>

        {/* Map/Visual Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8" data-aos="fade-up">
            <div className="md:w-1/2 text-center">
                <h3 className="text-2xl font-semibold text-textLight mb-4">Our Location</h3>
                <p className="text-gray-600">
                Find us at our main office. We’re always here to assist you with your needs.
                </p>
            </div>
            <div className="md:w-1/2">
                <img
                src={contactImage}
                alt="Contact Location"
                className="w-1/2 h-64 object-fill rounded-lg mx-auto"
                />
            </div>
            </div>
        </section>

        <Footer />
        </div>
    );
};

export default ContactUs;