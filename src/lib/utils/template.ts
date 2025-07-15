export default function template(templateString: any, templateVariables: any) {
   // @ts-ignore
  return templateString.replace(/{{(.*?)}}/g, (_, g) => templateVariables[g])
}
