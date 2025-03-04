import * as yup from 'yup'
import { type ImageItemWithText } from 'src/types/photos'

export type ArticleInputs = {
	articleName: string
	topDescs: string
	gallerySection?: boolean
	photos?: ImageItemWithText[]
	bottomDescsSection?: boolean
	bottomDescs?: string
}

export const articleSchema = yup.object().shape({
	articleName: yup.string().required('Введите название статьи'),
	topDescs: yup.string().required('Введите текст статьи'),
	gallerySection: yup.boolean(),
	bottomDescsSection: yup.boolean(),
	bottomDescs: yup.string().when('bottomDescsSection', ([bottomDescsSection]) => {
		return bottomDescsSection
			? yup.string().required('Введите текст статьи')
			: yup.string().notRequired()
	}),
})
