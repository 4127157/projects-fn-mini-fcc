/*TODO: 
    * Add CSS Styles to opinionate markdown preview
    */

import { marked } from "https://cdn.skypack.dev/marked@4.0.0";



marked.setOptions({
  breaks: true
});

document.getElementById(
  "editor"
).value = `# Welcome to my Markdown Previewer!
## It's made without the help of state managers or React! :) 
### Yep, it's just HTML/CSS and JS but uses the \`marked.js\` library for the markdown parsing to cover all the edge cases and save development time.

Heres some code  \`<div>"I'll never truly be a <\`section\`> :'("</div>\`  between 2 backticks.

\`\`\`
// this is multi-line code:

function anotherExample(firstLine, lastLine) {
  if (firstLine == \'\`\`\`\' && lastLine == \'\`\`\`\') {
    return multiLineCode;
  }
}
\`\`\`

You can also make text **bold**... for when you wanna be a Pepsi Commercial. \;\)

Or _italic_ ... just to really drive the point home.

Or **_both!_** In case you really, **_really_** wanna drive that point home.

And ~~use this~~ to censor top level secrets, nobody will ever know :#

[Find some cute chicks online right now! #Ad (~~but not really for legal reasons~~)](https://search.brave.com/images?q=chicken%20babies)

Yea, that was just to show that links work too :/

Here is a \`blockquote\` for when someone on the internet asks for sources and you really want it to appear official...

>> What go up, come down on head _ook ook_!
>> \\- Grug, ~~Upstanding~~ Cave Citizen

And if you're into excel, even tables:

Wild Header | Crazy Header | Another Header?
------------ | ------------- | -------------
Browsers are bloat! | Everything can be | done in excel.
Reject non-cellular | User Interfaces! | Embrace celled browsing.

- Acquire knowledge.
  - Acquire materials.
    - Repeat.  

>_...Is this what life is all about?_
>Sorry but I was talking about Minecraft, never played it, seems to be all the rage.


1. Those were bulleted lists up there with some optional indentation.
2. Now here's a numbered list!
3. **WOW! _EXCITING!_** _I LOOOOOOOVE NUMBERED LISTS!_

And here's my favourite kind of dog to show that it can handle images too:
![Golden Retriever with its tongue out](https://brocku.ca/brock-news/wp-content/uploads/2013/11/golden-retriever.jpeg)`;

window.addEventListener("DOMContentLoaded", (event) => {
  
  document.getElementById("preview").innerHTML = marked.parse(
    document.getElementById("editor").value
  );
  
  var expanded = false;
  
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  editor.addEventListener("input", markItDown);

  const editorButton = document.getElementById("editor_expand");
  const previewButton = document.getElementById("preview_expand");
  editorButton.addEventListener("click", expandIt);
  previewButton.addEventListener("click", expandIt);
  
  function expandIt(e) {
    e.preventDefault();
    
    var parentId = document.getElementById(e.target.parentNode.id).parentNode.id;
    
    var elem = document.getElementById(parentId);
  
    var elemSib = (elem.nextElementSibling.id != "") ? document.getElementById(elem.nextElementSibling.id) : document.getElementById(elem.previousElementSibling.id);
    
    if(!expanded){
      elemSib.style.display = "none";
      elem.style.flexBasis = "100%";
      elem.style.margin = "0.5em";
      e.target.innerHTML = "Shrink";
    } else if(expanded){
      elemSib.style.display = "";
      elem.style.flexBasis = "";
      elem.style.margin = "";
      e.target.innerHTML = "Expand";
    }
    expanded = !expanded;
  }
  
  function markItDown(e) {
    e.preventDefault();
    preview.innerHTML = marked.parse(e.target.value);
  }
});
