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
        obj.content = obj.content.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');

        // remove new lines
        obj.content = obj.content.replace(/(\n)/gm, '');

        // reduce to 1space
        obj.content = obj.content.replace(/(\s{2,})/gm, ' ');

        //remove most of the unuseful wrapping spaces
        obj.content = obj.content.replace(/\s?([\:\;\}\{\]\[\)\(\=\-\+\*])\s?/gm, '$1');
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
            msg.push('plugin ' + pluginName.white() + ' wrote ' + names.min + ' (' + self.getSize(names.min) + ')');
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