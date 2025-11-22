const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @type {Set<string>}
 */
let classSet = new Set();
let watcherDisposable = null;

async function loadClassesFromWorkspace() {
    classSet.clear();
    try {
        const uris = await vscode.workspace.findFiles('**/assets/css/**/*.css');
        // also include any bootstrap*.css anywhere under assets/css
        for (const uri of uris) {
            try {
                const bytes = await vscode.workspace.fs.readFile(uri);
                const content = Buffer.from(bytes).toString('utf8');
                parseCssForClasses(content);
            } catch (e) {
                console.error('Failed read', uri.fsPath, e);
            }
        }
    } catch (e) {
        console.error('findFiles error', e);
    }
}

function parseCssForClasses(content) {
    // crude regex to capture .class-name occurrences
    const re = /\.([a-zA-Z0-9_-]+)(?=[\s\.,:{>\[\#:])/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        if (m[1]) classSet.add(m[1]);
    }
}

function isInClassAttribute(document, position) {
    // look back up to 200 chars and check if we are inside class="..."
    const start = Math.max(0, document.offsetAt(position) - 200);
    const range = new vscode.Range(document.positionAt(start), position);
    const text = document.getText(range);
    // check pattern class= "... (not closed yet)
    // we allow single or double quotes
    const classAttrOpen = /class\s*=\s*['"][^'"]*$/i;
    return classAttrOpen.test(text);
}

function provideCompletionItems(document, position) {
    if (!isInClassAttribute(document, position)) return null;
    const items = [];
    for (const cls of classSet) {
        const it = new vscode.CompletionItem(cls, vscode.CompletionItemKind.Value);
        it.insertText = cls;
        it.detail = 'class (from assets/css)';
        items.push(it);
    }
    return items;
}

function activate(context) {
    console.log('Activating bootstrap-class-completion');
    const loadAndRegister = async () => {
        await loadClassesFromWorkspace();
        // register provider for HTML
        const provider = vscode.languages.registerCompletionItemProvider({ language: 'html', scheme: 'file' }, {
            provideCompletionItems(document, position) {
                return provideCompletionItems(document, position);
            }
        }, ' ', '"', '\'', '-');
        context.subscriptions.push(provider);

        // watch css files under assets/css
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
            const pattern = new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], 'assets/css/**/*.css');
            const watcher = vscode.workspace.createFileSystemWatcher(pattern);
            watcher.onDidChange(() => loadClassesFromWorkspace());
            watcher.onDidCreate(() => loadClassesFromWorkspace());
            watcher.onDidDelete(() => loadClassesFromWorkspace());
            context.subscriptions.push(watcher);
            watcherDisposable = watcher;
        }
    };

    loadAndRegister();
}

function deactivate() {
    if (watcherDisposable) watcherDisposable.dispose();
}

module.exports = { activate, deactivate };
