import P1 from "../assets/peep-1.png";
import P2 from "../assets/peep-2.png";
import P3 from "../assets/peep-3.png";
import P4 from "../assets/peep-4.png";
import P5 from "../assets/peep-5.png";
import P6 from "../assets/peep-6.png";
import P7 from "../assets/peep-7.png";
import P8 from "../assets/peep-8.png";
import P9 from "../assets/peep-9.png";
import P10 from "../assets/peep-10.png";
import P11 from "../assets/peep-39.png";
import { useEffect, useState } from "react";

const images = [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11];

const SlideShow = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-shrink-0">
            <img
                src={images[currentImageIndex]}
                alt="Rapid Image Change"
                className="h-48 w-[150px] pl-[20px]"
                width="150"
            />
        </div>
    );
};

export default SlideShow;
