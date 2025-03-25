import { SettingsContext } from "@/app/chat/page";
import { AudioLines, Palette, Volume2, VolumeX } from "lucide-react";
import { useContext, useState } from "react";

export default function Settings() {
	const themes = [
		"cupcake",
		"retro",
		"coffee",
		"forest",
		"winter",
		"dracula",
		"night",
	];
	const [themeIndex, setThemeIndex] = useState(1);
	const { settings, setSettings } = useContext(SettingsContext);
	return (
		<div className="bg-base-100 p-4 rounded-xl text-base-content shadow-sm grid grid-cols-6 gap-4">
			<div className="tooltip">
				<div className="tooltip-content text-lg font-bold translate-y-[-60px] translate-x-[15px] bg-base-200 p-2 border border-base-content text-base-content">
					Theme
				</div>
				<label className="swap swap-rotate ">
					<input
						type="radio"
						className="theme-controller"
						value={themes[themeIndex % themes.length]}
						onClick={() => setThemeIndex(themeIndex + 1)}
					/>
					<Palette size={30} />
				</label>
			</div>
			<div className="tooltip">
				<div className="tooltip-content text-lg font-bold translate-y-[-60px] translate-x-[15px] bg-base-200 p-2 border border-base-content text-base-content">
					Audio
				</div>
				{settings.audio ? (
					<Volume2
						onClick={() => setSettings({ ...settings, audio: false })}
						size={30}
					/>
				) : (
					<VolumeX
						onClick={() => setSettings({ ...settings, audio: true })}
						size={30}
					/>
				)}
			</div>
			<div className="tooltip">
				<div className="tooltip-content text-lg font-bold translate-y-[-60px] translate-x-[15px] bg-base-200 p-2 border border-base-content text-base-content">
					Voice: {(settings.voiceId % 4) + 1}
				</div>
				<AudioLines
					onClick={() =>
						setSettings({ ...settings, voiceId: settings.voiceId + 1 })
					}
					size={30}
				/>
			</div>
		</div>
	);
}
