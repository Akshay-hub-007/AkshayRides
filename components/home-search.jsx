"use client"
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Camera, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/use-fetch';
import { processImageSearch } from '@/actions/home';
import { parseError } from '@clerk/shared/dist/error';

function HomeSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isImageSearchActive, setIsImageSearchActive] = useState(true);
  const [imagePreview, setImagePreview] = useState("")
  const [searchImage, setSearchImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const router=useRouter()
  const handleTextSubmit = (event) => {
    event.preventDefault();
       if(!searchTerm)
       {
        toast.error("please enter the text first")
        return; 
       }

       router.push(`/cars?search=${(encodeURIComponent(searchTerm))}`)
  };

  const {
    loading:isProcessing,
    fn:processImageFn,
    data:processResult,
    error:processError
  }=useFetch(processImageSearch)
  const onDrop = acceptedFiles => {
    const file = acceptedFiles[0]

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than  5MB")
        return;
      }
    }
    setIsUploading(true)
    setSearchImage(file)

    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreview(reader.result)
      console.log(reader)
      setIsUploading(false)
      toast.success("Image uploaded successfully")

    }

    reader.onerror = () => {
      setIsUploading(false)
      toast.error("Error in uploading the image")
    }
    reader.readAsDataURL(file)
  }
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"]
    },
    maxFiles: 1
  })
  const handleImageSearch = async(e) => {

    e.preventDefault()
    if(!searchImage)
    {
       toast.error("Please upload the image first")
       return;
    }

    await processImageFn(searchImage)
   }

   useEffect(()=>{
    if(processResult.success)
    {
      const params=new URLSearchParams()
      if(process.data.make) params.set("make",processResult.data.make)
        if(processResult.data.bodyType)
          params.set("bodyType",processResult.data.bodyType)
        if(processResult.data.color)
          params.set("color",processResult.data.color)

        router.push(`/cars?${params.toString()}`)
    }
   },[processResult])
   useEffect(()=>{
    if(processError)
    {
      toast.error("Failed to analyze image :"+(processError.message ||" :Unknown Error"))
    }
   },[processError])
  return (
    <div className="relative">
      <form onSubmit={handleTextSubmit} className="w-full">
        <Input
          type="text"
          placeholder="Enter make model, or use our AI Image Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur"
        />
        <button type="submit" className="hidden" />
      </form>

      <div className="absolute right-[100px] top-1/2 transform -translate-y-1/2">
        <Camera
          size={35}
          onClick={() => setIsImageSearchActive(!isImageSearchActive)}
          className="cursor-pointer rounded-xl p-1.5"
          style={{
            background: isImageSearchActive ? "black" : "",
            color: isImageSearchActive ? "white" : "",
          }}
        />
      </div>
      <Button type="submit" className='absolute right-2 top-1 rounded-full'> Search</Button>

      {isImageSearchActive && (
        <div className='mt-4'>
          <form onSubmit={handleImageSearch}>
            <div className='border-2 border-dotted border-gray-300 rounded-3xl p-6 text-center'>
              {imagePreview ?
              <div className='flex flex-col items-center'>
                <img src={imagePreview} className="h-40 object-contain mb-4" alt="" />
                <Button onClick={() => {
                  setSearchImage(null)
                  setImagePreview("")
                  toast.info("Image removed")
                }}>Remove Image</Button>
              </div> :
              <div {...getRootProps()} className='cursor-pointer'>
                <input {...getInputProps()} />
                <div className='flex flex-col items-center'>
                  <Upload className='h-12 w-12  text-gray-400 mb-2' />
                  <p className='text-gray-500 mb-2'>
                    {
                        "Drag & drop a car image or click to select"
                    }
                  </p>
                  {
                    isDragReject && (
                      <p className='text-red-500 mb-2'>Invalid image type</p>
                    )
                  }

                  <p className='text-gray-400 text-sm'>
                    Support :JPG,PNG,Webp(max 5 MB)
                  </p>
                </div>
              </div>}
              </div>
           {imagePreview && (
            <Button type="submit" className={"w-full mt-2"} disabled={isUploading || isProcessing}>
              { isUploading?"isUploading":"Search with the Image"}
            </Button>
           )}
          </form>

        </div>
      )}
    </div>
  );
}

export default HomeSearch;
