import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'src', 'posts')

export function getPostBySlug (slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    metadata: data,
    content,
  }
}

export function getAllPosts () {
  const files = fs.readdirSync(postsDirectory)

  return files.map((file) => {
    const fullPath = path.join(postsDirectory, file)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

    return {
      slug: file.replace(/\.mdx$/, ''),
      metadata: data,
    }
  })
}
