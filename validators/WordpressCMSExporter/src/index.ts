import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import api from '@flatfile/api'
import axios from 'axios'

const listener = FlatfileListener.create((listener) => {
  listener.use(
    recordHook('contacts', async (record, event) => {
      const { jobId, environmentId, spaceId, sheetId } = event.context

      // Field mapping
      const fieldMapping = {
        title: 'name',
        content: 'description',
        author: 'email',
        categories: 'category',
        tags: 'tags',
        status: 'status',
        custom_fields: 'custom_fields',
      }

      // Prepare post data
      const postData = {}
      for (const [wpField, ffField] of Object.entries(fieldMapping)) {
        if (record.get(ffField)) {
          if (wpField === 'categories' || wpField === 'tags') {
            postData[wpField] = record
              .get(ffField)
              .split(',')
              .map((item) => item.trim())
          } else if (wpField === 'custom_fields') {
            postData[wpField] = JSON.parse(record.get(ffField) || '{}')
          } else {
            postData[wpField] = record.get(ffField)
          }
        }
      }

      try {
        // Get WordPress API credentials from Flatfile space metadata
        const { data: space } = await api.spaces.get(spaceId)
        const wpApiUrl = space.metadata.wpApiUrl
        const wpApiKey = space.metadata.wpApiKey

        if (!wpApiUrl || !wpApiKey) {
          throw new Error(
            'WordPress API credentials not found in space metadata'
          )
        }

        const headers = {
          Authorization: `Bearer ${wpApiKey}`,
          'Content-Type': 'application/json',
        }

        // Check if post already exists (assuming 'name' is unique identifier)
        const existingPosts = await axios.get(
          `${wpApiUrl}/wp-json/wp/v2/posts?search=${postData.title}`,
          { headers }
        )

        let response
        if (existingPosts.data.length > 0) {
          // Update existing post
          const postId = existingPosts.data[0].id
          response = await axios.put(
            `${wpApiUrl}/wp-json/wp/v2/posts/${postId}`,
            postData,
            { headers }
          )
        } else {
          // Create new post
          response = await axios.post(
            `${wpApiUrl}/wp-json/wp/v2/posts`,
            postData,
            { headers }
          )
        }

        // Update record with WordPress post ID
        record.set('wp_post_id', response.data.id)

        return record
      } catch (error) {
        console.error('Error exporting to WordPress:', error.message)
        record.addError('wordpress_export', 'Failed to export to WordPress')
        return record
      }
    })
  )
})

export default listener
