import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-400 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-5">

        {/* Copyright */}
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} AI Bug Fix Agent. All rights reserved.
        </p>


        {/* Developed By */}
        <p className="text-sm text-gray-400">
          Designed & Developed by{" "}
          <span className="text-white font-medium">
            Aayushi Mishra
          </span>
        </p>


        {/* Social Links */}
        <div className="flex items-center gap-5">

          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <FaGithub size={21} />
          </a>

          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <FaLinkedin size={21} />
          </a>

        </div>

      </div>
    </footer>
  );
};

export default Footer;