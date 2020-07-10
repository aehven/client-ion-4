/////
// For sending form.value as gql mutation input.  This requires the json object
// not to have quotes around property names, but the object form.value does,
// so this is a way to stringify form json without quotes around property names.
// Thanks to https://stackoverflow.com/a/11233515/5874744
<<<<<<< HEAD
=======
//
// Added the filtering out of null values because it breaks without it.
>>>>>>> master
/////
export function stringify(obj_from_json) {
  if (typeof obj_from_json !== "object" || Array.isArray(obj_from_json)){
      // not an object, stringify using native function
      return JSON.stringify(obj_from_json);
  }
  // Implements recursive object serialization according to JSON spec
  // but without quotes around the keys.
  let props = Object
      .keys(obj_from_json)
<<<<<<< HEAD
=======
      .filter(key => obj_from_json[key] != null)
>>>>>>> master
      .map(key => `${key}:${stringify(obj_from_json[key])}`)
      .join(",");
  return `{${props}}`;
}
