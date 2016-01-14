export default function pagify(node){
    let current = node.querySelector('.page');
    while(current.scrollHeight > current.clientHeight){
        const newPage = document.createElement('div');
        newPage.className="page extra";
        node.appendChild(newPage);
        while(current.scrollHeight > current.clientHeight){

            if(!current.lastChild.clientHeight || current.lastChild.clientHeight < current.clientHeight){
                newPage.insertBefore(current.lastChild, newPage.firstChild);
            }
            else{
                // recurse, i guess
                break;
            }
        };
        current = newPage;
    }
    const pages = node.querySelectorAll('.extra')
    Array.prototype.map.call(pages, function(page, i) {
        const el = document.createElement('div');
        el.className = "page-number";
        el.textContent = i+2;
        page.appendChild(el);
    });


}