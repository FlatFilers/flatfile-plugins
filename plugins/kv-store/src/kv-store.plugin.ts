const checkEnv = () => {
  if (!process.env.FLATFILE_KV_URL) {
    throw new Error('FLATFILE_KV_URL is not set')
  }
  if (!process.env.FLATFILE_API_KEY) {
    throw new Error('FLATFILE_API_KEY is not set')
  }
}

export const kv = {
    set: async (key: string, value: any): Promise<void> => {
      checkEnv()
      try {
        const response = await fetch(`${process.env.FLATFILE_KV_URL}/key/${key}`, {
          method: 'POST',
          body: JSON.stringify({ value: JSON.stringify(value) }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.FLATFILE_API_KEY}`
          },
        })
  
        if (!response.ok) {
          throw new Error(await response.text())
        }
      } catch (error) {
        throw new Error(`KV Store: Failed to set value '${value}' to key '${key}'. Error: ${error}`)
      }
    },
    get: async (key: string): Promise<any> => {
      checkEnv()
      try {
        const response = await fetch(`${process.env.FLATFILE_KV_URL}/key/${key}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.FLATFILE_API_KEY}`
          },
        })
  
        if (!response.ok) {
          if (response.status === 404) {
            // If the key does not exist, return null
            return null
          }
          throw new Error(await response.text())
        }
  
        const data = JSON.parse(await response.text())?.data
  
        if (!data) {
          return null
        }
  
        try {
          return JSON.parse(data)
        } catch (error) {
          throw new Error(`KV Store: Failed to parse value '${data}' for key '${key}'. Error: ${error}`)
        }
      } catch (error) {
        throw new Error(`KV Store: Failed to get value for key '${key}'. Error: ${error}`)
      }
    },
    clear: async (key: string): Promise<void> => {
      try {
        return await kv.set(key, null)
      } catch (error) {
        throw new Error(`KV Store: Failed to clear key '${key}'. Error: ${error}`)
      }
    },
    list: {
      append: async (key: string, values: any[], options: {
        unique: boolean
      } = { unique: false }): Promise<void> => {
        try {
          // Retreive the current value
          const currentValue = await kv.get(key)
    
          if (!currentValue) {
            // If no current value, set the value
            return await kv.set(key, [...values])
          }
    
          // If the current value is an array, append the value
          if (Array.isArray(currentValue)) {
            if (options.unique) {
              // If unique, check if the values are already in the array
              const newValues = values.filter((value: any) => !currentValue.includes(value))
              if (newValues.length === 0) {
                // If there are no new values, return
                return
              }
              // If there are new values, append them to the current value
              return await kv.set(key, [...currentValue, ...newValues]) 
            }
            // If not unique, append the values to the current value
            return await kv.set(key, [...currentValue, ...values])
          }
    
          // If the current value is not an array, make it an array
          return await kv.set(key, [currentValue, ...values])
        } catch (error) {
          throw new Error(`KV Store: Failed to set values '${values}' to key '${key}'. Error: ${error}`)
        }
      },
      delete: async (key: string, values: any[]): Promise<void> => {
        try {
          // Retreive the current value
          const currentValue = await kv.get(key)
    
          if (!currentValue) {
            // If no current value, return
            return
          }
    
          // If the current value is not an array, throw an error
          if (!Array.isArray(currentValue)) {
            throw new Error('Value is not an array')
          }
    
          // Remove the values from the array
          const newValues = currentValue.filter((value: any) => !values.includes(value))
          return await kv.set(key, newValues)
        } catch (error) {
          throw new Error(`KV Store: Failed to delete values '${values}' from key '${key}'. Error: ${error}`)
        }
      },
      pop: async (key: string): Promise<any> => {
        try {
          // Retreive the current value
          const currentValue = await kv.get(key)
    
          if (!currentValue) {
            // If no current value, return
            return null
          }
    
          // If the current value is not an array, throw an error
          if (!Array.isArray(currentValue)) {
            throw new Error('Value is not an array')
          }
    
          // Get the last value and remove it from the array
          const lastValue = currentValue.pop()
          await kv.set(key, currentValue)
          return lastValue
        } catch (error) {
          throw new Error(`KV Store: Failed to pop from key '${key}'. Error: ${error}`)
        }
      },
      shift: async (key: string): Promise<any> => {
        try {
          // Retreive the current value
          const currentValue = await kv.get(key)
    
          if (!currentValue) {
            // If no current value, return
            return null
          }
    
          // If the current value is not an array, throw an error
          if (!Array.isArray(currentValue)) {
            throw new Error('Value is not an array')
          }
    
          // Get the first value and remove it from the array
          const firstValue = currentValue.shift()
          await kv.set(key, currentValue)
          return firstValue
        } catch (error) {
          throw new Error(`KV Store: Failed to shift from key '${key}'. Error: ${error}`)
        }
      },
    }
  }