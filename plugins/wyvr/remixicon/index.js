import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Logger } from '@lib/utils/logger.js';

// plugin to reduce the size of the remixicons
// by searching unused icons and removing them
const used_remixicons = [];

const pkg_name = '[package-remixicon]';

export default {
    inject: {
        after: async (err, config, file, content, head, body) => {
            if (config.env == 'dev') {
                return [err, config, file, content, head, body];
            }
            // search for all used icons
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
            return [err, config, file, content, head, body];
        },
    },
    link: {
        before: async (...args) => {
            const config = args[1];
            if (config.env == 'dev') {
                Logger.improve(`${pkg_name} will not be executed in dev mode`);
                return args;
            }
            // write used icons file
            Logger.debug(`${pkg_name} use ${used_remixicons.length} icons`);
            const used_regex = new RegExp(`${used_remixicons.join('|')}`);
            const remixicon_file = 'gen/assets/remixicon/remixicon.css';
            if (!existsSync(remixicon_file)) {
                Logger.error(`${pkg_name} file does not exist ${remixicon_file}`);
                return args;
            }
            let removed = 0;
            const content = readFileSync(remixicon_file, { encoding: 'utf-8' })
                .split('\n')
                .filter((line) => {
                    if (line.trim().indexOf('.ri-') != 0 || (used_remixicons.length > 0 && line.match(used_regex))) {
                        return true;
                    }
                    if (line.trim().indexOf('.ri-') == 0) {
                        removed++;
                    }
                    return false;
                })
                .join('\n');
            Logger.debug(`${pkg_name} removed ${removed} lines`);
            if (content) {
                const percent = 100 - Math.floor((used_remixicons.length / (used_remixicons.length + removed)) * 100);
                Logger.improve(`${pkg_name} shrinked by ~${percent}%`);
                writeFileSync('gen/assets/remixicon/remixicon.used.css', content);
            }
            return args;
        },
    },
};
