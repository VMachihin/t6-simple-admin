import React, { type FC, type ReactNode, useEffect, useState, useCallback } from 'react'
import { type Accept, useDropzone } from 'react-dropzone'

import cn from 'classnames'
import { useFormContext } from 'react-hook-form'

import { FilePreviews } from 'src/components/file-previews/file-previews'
import { RemovePhotoSvg } from 'src/UI/icons/removePhotoSVG'
import { ErrorMessage } from '@hookform/error-message'
import { AttachIconSvg } from 'src/UI/icons/attachIconSVG'

import styles from './index.module.scss'
import {
	useDeleteImageByIdMutation,
	useUploadImagesMutation,
} from 'src/store/uploadImages/uploadImages.api'
import { useParams } from 'react-router-dom'
import { type ImageItemWithText } from 'src/types/photos'

type ReactDropzoneProps = {
	name: string
	accept?: Accept
	multiple?: boolean
	maxFiles?: number
	margin?: string
	prompt?: string
	className?: string
	dzAreaClassName?: string
	label?: string
	removeIcon?: ReactNode
	customUploadBtn?: ReactNode
	customOpenModal?: ReactNode
	uploadBtnText?: string
	variant?: 'main' | 'text' | 'culture'
	previewVariant?: 'main' | 'text' | 'sm-img' | 'list' | 'img-list' | 'sm-img-edit'
	imgtype?: string
	imageIdFieldName?: string
	fileImages?: ImageItemWithText[]
	imgEditId?: string
}

export const ReactDropzone: FC<ReactDropzoneProps> = ({
	className,
	dzAreaClassName,
	removeIcon,
	variant = 'main',
	previewVariant,
	name,
	accept,
	multiple = false,
	maxFiles = 1,
	customUploadBtn,
	customOpenModal,
	uploadBtnText = 'Загрузить',
	prompt,
	label,
	margin,
	imgtype = 'news',
	imageIdFieldName,
	fileImages = [],
	imgEditId = '',
}) => {
	const [currentFiles, setCurrentFiles] = useState<ImageItemWithText[]>([])
	const [imageIds, setImageIds] = useState<string[]>([])

	const {
		register,
		setValue,
		formState: { errors },
	} = useFormContext()

	const [uploadImages] = useUploadImagesMutation()
	const [deleteImageById] = useDeleteImageByIdMutation()

	const { id = '' } = useParams()

	const uploadFile = useCallback(
		async (file: File) => {
			try {
				const formData = new FormData()
				if (imgEditId) {
					formData.append('itemimage', file)
					formData.append('id', imgEditId)
				} else {
					formData.append('itemimage', file)
					formData.append('imgtype', imgtype)
					formData.append('id_item', id)
				}

				const response = await uploadImages(formData).unwrap()
				if (response.status === 'ok') {
					const imageId = response.id_catimage
					return imageId
				} else {
					console.error('Upload failed:', response)
					return null
				}
			} catch (error) {
				console.error('Upload failed:', error)
				return null
			}
		},
		[uploadImages, imgtype],
	)

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const newFiles: ImageItemWithText[] = []
			const uploadedImageIds: string[] = []

			for (const file of acceptedFiles) {
				try {
					const imageId = await uploadFile(file)
					if (imageId) {
						uploadedImageIds.push(imageId)
						const newFile = Object.assign(file, {
							id: imageId,
							thumbnail: URL.createObjectURL(file),
						})
						newFiles.push(newFile)
					}
				} catch (error) {
					console.error('File upload failed:', error)
				}
			}

			setCurrentFiles((prevFiles) => [...prevFiles, ...newFiles].slice(0, maxFiles))
			setImageIds((prevIds) => [...prevIds, ...uploadedImageIds].slice(0, maxFiles))
			setValue(name, newFiles)
		},
		[uploadFile, setValue, name, maxFiles],
	)

	const removeFile = useCallback(
		async (index: number) => {
			const imageIdToRemove = imageIds[index]
			try {
				if (imageIdToRemove && imgEditId === '') {
					await deleteImageById(imageIdToRemove).unwrap()
				}
				const newFiles = currentFiles.toSpliced(index, 1)
				const newImageIds = imageIds.toSpliced(index, 1)

				setCurrentFiles(newFiles)
				setImageIds(newImageIds)
				setValue(name, newFiles)

				if (imageIdFieldName) {
					setValue(
						imageIdFieldName,
						imageIds.filter((id, i) => i !== index),
					)
				}
			} catch (error) {
				console.error('Delete failed:', error)
			}
		},
		[currentFiles, imageIds, deleteImageById, setValue, name, imageIdFieldName],
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept,
		multiple,
		maxFiles,
		disabled: !!customOpenModal,
	})

	useEffect(() => {
		if (fileImages && fileImages.length > 0) {
			setCurrentFiles(fileImages)
			const initialImageIds = fileImages.map((img) => img.id)
			setImageIds(initialImageIds)
		}
	}, [fileImages])

	const dropzoneArea = (
		<div
			className={cn(dzAreaClassName, {
				[styles.activeArea]: isDragActive,
				[styles.dropzoneArea]: !customUploadBtn,
			})}
			{...getRootProps()}
		>
			<input {...register(name)} {...getInputProps()} />
			{customUploadBtn ?? (
				<>
					<span>Прикрепить файл</span>
					<p>
						{prompt ?? 'Перетащите файл на это поле'} <AttachIconSvg />
					</p>
				</>
			)}
		</div>
	)

	if (variant === 'culture') {
		return (
			<div className={cn(styles.textFileUpload, className)} style={{ margin: margin ?? '' }}>
				{label && <label>{label}</label>}
				<input {...register(name)} {...getInputProps()} />
				<FilePreviews
					variant={'culture-img-list'}
					files={currentFiles}
					imgtype={imgtype}
					removeBtn={removeIcon ?? <RemovePhotoSvg />}
					removeHandler={removeFile}
					uploadBtn={currentFiles.length < maxFiles ? dropzoneArea : null}
				/>
				{errors[name] && (
					<p className={styles.warningMessage}>
						<ErrorMessage errors={errors} name={name} />
					</p>
				)}
			</div>
		)
	}

	return (
		<div className={cn(styles.reactDropzone, className)} style={{ margin: margin ?? '' }}>
			{label && <label>{label}</label>}
			<FilePreviews
				variant={previewVariant ?? 'main'}
				files={currentFiles}
				imgtype={imgtype}
				removeBtn={removeIcon ?? <RemovePhotoSvg />}
				removeHandler={removeFile}
			/>
			{currentFiles.length < maxFiles && (
				<div
					className={cn(dzAreaClassName, {
						[styles.activeArea]: isDragActive,
						[styles.dropzoneArea]: !customUploadBtn && !customOpenModal,
					})}
					{...getRootProps()}
				>
					<input {...register(name)} {...getInputProps()} />
					{customUploadBtn ?? customOpenModal ?? (
						<>
							<span>Прикрепить файл</span>
							<p>
								{prompt ?? 'Перетащите файл на это поле'} <AttachIconSvg />
							</p>
						</>
					)}
				</div>
			)}
			{errors[name] && (
				<p className={styles.warningMessage}>
					<ErrorMessage errors={errors} name={name} />
				</p>
			)}
		</div>
	)
}
