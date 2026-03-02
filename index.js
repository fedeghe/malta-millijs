const path = require('path'),
    fs = require('fs');

function malta_millijs(obj, options) {

    /**
     * The context of the call is the malta instance,
     * so from here you can get all information about
     * the original template path, all plugins involved
     * all options, the output folder, an on..
     * @type Object
     */
    const self = this,

        // just to show some stats on the console
        // about the time required by the plugin
        start = new Date(),

        // a message the plugin can send to the console
        msg = [],
        pluginName = path.basename(path.dirname(__filename)),

        originalContent = obj.content,
        originalName = obj.name,
        done = { min: false, clean: false },
        names = {};

    let leaveOriginal = false;

    options = options || {};

    leaveOriginal = 'leaveOrig' in options && options.leaveOrig;

    names.min = leaveOriginal
        ? obj.name.replace(/\.js$/, '.min.js')
        : originalName;

    done.clean = !leaveOriginal;

    try {
        // remove multi/single line comments
        obj.content = obj.content
            .replace(/\/\*[\s\S]*?\*\//g, '')          // multiline comments
            .replace(/(^|[^:\\])\/\/.*$/gm, '$1');     // single-line comments

        // remove new lines
        obj.content = obj.content.replace(/\R/g, '');

        // reduce to 1space
        const STRINGS = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g;

        obj.content = obj.content
            .split(STRINGS)
            .map((part, i) => {
                if (i % 2) return part; // keep "..." / '...' / `...` untouched

                return part
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/(^|[^:\\])\/\/.*$/gm, '$1')
                .replace(/\r?\n/g, '')
                .replace(/[ \t]{2,}/g, ' ')
                .replace(/\s*([:;{}[\]()=+*,-])\s*/g, '$1');
            })
            .join('')
            .trim();

    } catch (err) {
        self.doErr(err, obj, pluginName);
    }

    return (solve, reject) => {

        const mayHaveDone = () => {
            if (done.min && done.clean) {
                solve(obj);
                self.notifyAndUnlock(start, msg.join("\n"));
            }
        };

        fs.writeFile(names.min, obj.content, (err) => {
            err && self.doErr(err, obj, pluginName);
            done.min = true;
            const newSize = obj.content.length,
                originalSize = originalContent.length;
            msg.push('plugin ' + pluginName.white() + ' wrote ' + names.min + ' (' + self.getSize(names.min) + ' | '+(100*newSize / originalSize).toFixed(2)+'% of original)');
            mayHaveDone();
        });
        leaveOriginal && fs.writeFile(originalName, originalContent, (err) => {
            err && self.doErr(err, obj, pluginName);
            done.clean = true;
            msg.push('plugin ' + pluginName.white() + ' wrote ' + originalName + ' (' + self.getSize(originalName) + ')');
            mayHaveDone();
        });
    }
}
/**
 * if the plugin shall be used only on some special file types
 * declare it (it can be an array too)  
 * if not specified the plugin will be called on any file
 */
malta_millijs.ext = ['js', 'coffee', 'ts'];

// export
module.exports = malta_millijs;