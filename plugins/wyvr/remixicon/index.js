import { filled_array } from "wyvr/src/utils/validate.js";
import { read, write } from "wyvr/src/utils/file.js";
import { logger } from "wyvr/universal.js";

// plugin to reduce the size of the remixicons
// by searching unused icons and removing them
const used_remixicons = [];
let remixicons_file;

const pkg_name = "[package-remixicon]";

export default {
	optimize: {
		before: async ({ err, args: [files, ...params] }) => {
			if (filled_array(files)) {
				for (const file of files) {
					if (file.indexOf("/assets/remixicon/remixicon.css") > -1) {
						remixicons_file = file;
					}
					if (file.match(/\.html?$/)) {
						const content = read(file);
						const matches = content.match(/["\s]ri-[^\s"]+/g);
						if (matches) {
							for (const match of matches) {
								const cleanedMatch = match.replace(/^./, "");
								if (used_remixicons.indexOf(cleanedMatch) === -1) {
									used_remixicons.push(cleanedMatch);
								}
							}
						}
					}
				}
			}
			if (remixicons_file) {
				let removed = 0;
				const used_regex = new RegExp(`${used_remixicons.join("|")}`);
				const content = read(remixicons_file)
					.split("\n")
					.filter((line) => {
						const index = line.trim().indexOf(".ri-");
						if (
							index !== 0 ||
							(used_remixicons.length > 0 && line.match(used_regex))
						) {
							return true;
						}
						if (index === 0) {
							removed++;
						}
						return false;
					})
					.join("\n");
				// override the remixicons file
				write(remixicons_file, content);
				if (content) {
					const percent =
						100 -
						Math.floor(
							(used_remixicons.length / (used_remixicons.length + removed)) *
								100,
						);
					logger.improve(
						`${pkg_name} removed ${removed} icons - shrinked by ~${percent}%`,
					);
				}
			}
			return { err, args: [files, ...params] };
		},
	},
};
