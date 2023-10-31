import { Flatfile } from '@flatfile/api'
import { SetupFactory } from '@flatfile/plugin-space-configure'
import axios from 'axios'

export type PartialWorkbookConfig = Omit<
  Flatfile.CreateWorkbookConfig,
  'sheets' | 'name'
> & {
  name?: string
}
export type PartialSheetConfig = Omit<
  Flatfile.SheetConfig,
  'fields' | 'name'
> & {
  name?: string
}

export type ModelsToSheetConfig = { [key: string]: PartialSheetConfig }

type JsonSchema = {
  "title"?: string,
  "description"?: string,
  "type": string,
  "properties": Record<string, unknown>,
  "required"?: string[],
  "dependentRequired"?: Record<string, string[]>,
  [key: string]: any
}

type BlueprintField = {
  key: string,
  label?: string,
  type: string,
  description?: string
  config?: Record<string, any>
}

interface ApiSchemas {
  [key: string]: JsonSchema
}

// const convertPropertyToField = (property: JsonSchema) => {

// }

export async function generateSetup(
  name: string,
  url: string,
  options?: {
    models?: ModelsToSheetConfig
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  }
): Promise<any>{
  try{
    const { status, data } = await axios.get(url);
    
    if (status !== 200) {
      throw new Error(`API returned status ${status}: ${data.statusText}`)
    }

    const workbook = {
      "name": name,
      "description": data.description,
      "slug": name.split(" ").join(""),
      "readOnly": false,
      "access": ["add", "edit"],
      "sheets": new Array<BlueprintField>,
    }

    const blueprintFields = Object.keys(data.properties).map((propertyKey)=>{
      const property: JsonSchema = data.properties[propertyKey];
      const schemaEntry: BlueprintField = {
        key: propertyKey,
        type: property.type,
        description: property.description || undefined,
        config: {}
      };
      return schemaEntry
    })
    blueprintFields.forEach((field)=>workbook.sheets.push(field));
    
    console.log(workbook)
    return workbook
  }
  catch(error: any){
    console.error(error)
    throw new Error(`Error fetching or processing schema: ${error.message}`)
  }
}