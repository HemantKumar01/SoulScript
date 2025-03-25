import Avatar from "./avatar";
import Settings from "./settings";

export default function Sidebar() {
	return (
		<div className="p-8 w-full md:h-screen h-1/4 md:w-1/4 bg-base-200 flex md:flex-col flex-row">
			<div className="flex-1">
				<Avatar />
			</div>
			<div className="flex-0">
				<Settings />
			</div>
		</div>
	);
}
