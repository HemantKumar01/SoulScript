"use client";
import { MessageCircle, Upload } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";
import Wave from "react-wavify";
import Link from "next/link";

export default function Home() {
	return (
		<div className="">
			<div className="h-screen bg-base-100 place-items-center place-content-center ">
				<div>
					<div className="text-7xl font-bold px-16 text-base-content drop-shadow-lg alfa">
						PersonaBot
					</div>
					<motion.div
						initial={{ translateY: 50, opacity: 0 }}
						animate={{
							translateY: 0,
							opacity: 1,
							transition: { duration: 0.8 },
						}}
						className="text-9xl font-bold py-8 px-16 bg-clip-text text-transparent bg-gradient-to-r from-base-content to-accent drop-shadow-lg"
					>
						Empowering Mental Health with Personal Care
					</motion.div>
				</div>

				<div className="flex gap-4 p-16">
					<motion.div
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						className="bg-neutral text-neutral-content p-4 rounded-md flex font-bold text-xl shadow-lg hover:shadow-xl"
					>
						Upload History &nbsp; <Upload />
					</motion.div>
					<Link href="chat">
						<motion.div
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							className="bg-neutral text-neutral-content p-4 rounded-md flex font-bold text-xl shadow-lg hover:shadow-xl"
						>
							Chat &nbsp; <MessageCircle />
						</motion.div>
					</Link>
				</div>
				<Wave
					fill={"#34283d"}
					paused={false}
					className="absolute bottom-0"
					style={{ display: "flex" }}
					options={{
						height: 20,
						amplitude: 20,
						speed: 0.3,
						points: 3,
					}}
				/>
			</div>
		</div>
	);
}
