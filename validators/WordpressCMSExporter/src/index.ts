import {
  FlatfileListener,
  FlatfileEvent,
  RecordObject,
  SchemaField,
} from '@flatfile/listener'
import api from '@flatfile/api'
import { recordHook } from '@flatfile/plugin-record-hook'
import axios from 'axios'
import { parse } from 'node-html-parser'

const WordpressCMSExport = (listener: FlatfileListener) => {
  let wpConfig = {
    apiUrl: '',
    username: '',
    password: '',
  }

  listener.use(
    recordHook('wordpress_posts', async (record: RecordObject) => {
      const mappedFields = mapFields(record)
      const defaultSettings = await getDefaultSettings()
      const postWithDefaults = applyDefaultSettings(
        mappedFields,
        defaultSettings
      )
      const preview = await previewPost(postWithDefaults)
      record.set('preview', preview)
      return record
    })
  )
  listener.on(
    'job:ready',
    { job: 'workbook:exportToWordpress' },
    async (event: FlatfileEvent) => {
      const { jobId, workspaceId } = event.context
      try {
        await api.jobs.ack(jobId, {
          info: 'Starting WordPress export',
          progress: 10,
        })

        const records = await api.records.get(workspaceId, 'wordpress_posts')
        const exportedRecords = await batchExport(records.data)

        await api.jobs.complete(jobId, {
          outcome: {
            message: `Successfully exported ${exportedRecords.length} posts to WordPress`,
          },
        })
      } catch (error) {
        await api.jobs.fail(jobId, {
          outcome: {
            message: `Export failed: ${error.message}`,
          },
        })
      }
    }
  )

  listener.on('commit:created', async (event: FlatfileEvent) => {
    const { workspaceId } = event.context
    try {
      await api.spaces.update(workspaceId, {
        metadata: {
          wpConfig: {
            configured: false,
          },
        },
      })
    } catch (error) {
      console.error('Failed to update workspace metadata:', error)
    }
  })

  const mapFields = (record: RecordObject) => {
    return {
      title: record.get('post_title'),
      content: record.get('post_content'),
      status: record.get('post_status') || 'draft',
      date: record.get('post_date'),
      author: record.get('post_author'),
      categories: record.get('post_categories'),
      tags: record.get('post_tags'),
      customFields: handleCustomFields(record),
    }
  }

  const handleCustomFields = (record: RecordObject) => {
    const customFields = {}
    const fieldKeys = Object.keys(record.value).filter((key) =>
      key.startsWith('custom_')
    )
    fieldKeys.forEach((key) => {
      customFields[key.replace('custom_', '')] = record.get(key)
    })
    return customFields
  }

  const getDefaultSettings = async () => {
    // Fetch default settings from WordPress or a configuration file
    return {
      status: 'draft',
      author: 'admin',
      categories: ['Uncategorized'],
      tags: [],
    }
  }

  const applyDefaultSettings = (postData, defaultSettings) => {
    return {
      ...defaultSettings,
      ...postData,
    }
  }

  const previewPost = async (postData) => {
    // Generate HTML preview of the post
    const html = `
      <h1>${postData.title}</h1>
      <p>Author: ${postData.author}</p>
      <div>${postData.content}</div>
    `
    return parse(html).toString()
  }

  const exportToWordpress = async (postData) => {
    const { apiUrl, username, password } = wpConfig
    try {
      const response = await axios.post(
        `${apiUrl}/wp-json/wp/v2/posts`,
        postData,
        {
          auth: {
            username,
            password,
          },
        }
      )
      return response.data.id
    } catch (error) {
      throw new Error(`Failed to export post: ${error.message}`)
    }
  }

  const batchExport = async (records) => {
    const exportedRecords = []
    for (const record of records) {
      try {
        const postData = mapFields(record)
        const postId = await exportToWordpress(postData)
        exportedRecords.push({ id: postId, title: postData.title })
      } catch (error) {
        console.error(`Failed to export record ${record.id}:`, error)
      }
    }
    return exportedRecords
  }

  return listener
}

export default WordpressCMSExport
