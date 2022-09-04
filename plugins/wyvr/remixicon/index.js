import { existsSync, readFileSync, writeFileSync } from 'fs';
import { filled_array } from '@lib/utils/validate.js';
import { read, write } from '@lib/utils/file.js';
import { Logger } from '@lib/utils/logger.js';

// plugin to reduce the size of the remixicons
// by searching unused icons and removing them
const used_remixicons = [];
let remixicons_file;

const pkg_name = '[package-remixicon]';

export default {
    optimize: {
        before: async ({ err, args: [files, ...params] }) => {
            if (filled_array(files)) {
                files
                    .filter((file) => {
                        if (file.indexOf('/assets/remixicon/remixicon.css') > -1) {
                            remixicons_file = file;
                        }
                        return file.match(/\.html?$/);
                    })
                    .forEach((file) => {
                        const content = read(file);
                        const matches = content.match(/["\s]ri-[^\s"]+/g);
                        if (matches) {
                            matches
                                .map((match) => match.replace(/^./, ''))
                                .forEach((match) => {
                                    if (used_remixicons.indexOf(match) == -1) {
                                        used_remixicons.push(match);
                                    }
                                });
                        }
                    });
            }
            if (remixicons_file) {
                let removed = 0;
                const used_regex = new RegExp(`${used_remixicons.join('|')}`);
                const content = read(remixicons_file)
                    .split('\n')
                    .filter((line) => {
                        if (
                            line.trim().indexOf('.ri-') != 0 ||
                            (used_remixicons.length > 0 && line.match(used_regex))
                        ) {
                            return true;
                        }
                        if (line.trim().indexOf('.ri-') == 0) {
                            removed++;
                        }
                        return false;
                    })
                    .join('\n');
                // override the remixicons file
                write(remixicons_file, content);
                if (content) {
                    const percent = 100 - Math.floor((used_remixicons.length / (used_remixicons.length + removed)) * 100);
                    Logger.improve(`${pkg_name} removed ${removed} icons - shrinked by ~${percent}%`);
                }
            }
            return { err, args: [files, ...params] };
        },
    },
};
