import { splitAndTrimStringToArray } from 'src/helpers/utils'
import * as yup from 'yup'

export type NewsGallery = {
	label: string
	id: string
}

export type NewsPhoto = {
	id: string
	thumbnail: string
	original: string
	title: string
}

export type OneNewsInputs = {
	title: string
	itemdate: Date
	tags: string[]
	news_gallerys?: NewsGallery[]
	short: string
	full: string
	photo?: NewsPhoto[]
	description: string
	keywords: string[]
	main?: boolean
	hidden?: boolean
}

export const oneNewsSchema = yup.object().shape({
	title: yup
		.string()
		.required('Заголовок обязателен')
		.max(200, 'Заголовок не может превышать 200 символов'),
	itemdate: yup.date().required('Введите дату'),
	tags: yup
		.array()
		.of(yup.string().trim().required('Тег обязателен'))
		.min(1, 'Должен быть хотя бы один тег')
		.max(5, 'Максимум 5 тегов')
		.required('Теги обязательны')
		.transform(splitAndTrimStringToArray),
	short: yup.string().required('Введите короткое описание'),
	full: yup.string().required('Введите текст новости'),
	description: yup.string().required('Введите описание'),
	keywords: yup
		.array()
		.of(yup.string().trim().required('Ключевое слово обязательно'))
		.min(1, 'Должно быть хотя бы одно ключевое слово')
		.required('Ключевые слова обязательны')
		.transform(splitAndTrimStringToArray),
})
