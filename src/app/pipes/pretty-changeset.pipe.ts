import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyChangeset'
})
export class PrettyChangesetPipe implements PipeTransform {

  transform(audit): string {
    if(!audit) {
      return "";
    }
    let changeset = JSON.parse(audit.jsonChangeset);
    let event = audit.event;
    let output = "<ul>";

    if(event == "destroy") {
      output += "<li>All values erased.</li>";
    }
    else {
      for(let key of Object.keys(changeset)) {
        if(!changeset[key][0] || changeset[key][0] == "" || changeset[key][0] == "null") {
          output += `<li><b>${key}</b> initialized to <em>${changeset[key][1]}</em>.</li>`
        }
        else {
          output += `<li><b>${key}</b> changed from <em>${changeset[key][0]}</em> to <em>${changeset[key][1]}</em>.</li>`
        }
      }
    }

    output += "</ul>";

    return output;
  }
}
