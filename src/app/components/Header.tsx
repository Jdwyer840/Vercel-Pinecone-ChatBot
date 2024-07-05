import Image from "next/image";
import PineconeLogo from "../../../public/pinecone.svg";
import VercelLogo from "../../../public/vercel.svg";
import React from "react";
import '../globals.css'

interface HeaderProps {
    className?: string
}

const Header: React.FC<HeaderProps> = ({ className}) => {
    return (
        <header
            className={`flex items-center justify-center text-gray-200 text-2xl ${className}`}
        >
            <Image
                src={PineconeLogo}
                alt="pinecone-logo"
                width="230"
                height="50"
                className="ml-3"
            />{" "}
            <div className="text-4xl ml-3 mr-3">+</div>
            <Image
                src={VercelLogo}
                alt="vercel-logo"
                width="160"
                height="50"
                className="mr-3 mt-3"
            />

        </header>
    )
}

export default Header;
