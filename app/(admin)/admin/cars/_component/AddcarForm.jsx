"use client"

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Camera, Loader, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { addCar, processCarImageWithAI } from '@/actions/cars';
import { useRouter } from 'next/navigation';
function AddCarForm() {

  const [activeTab, setActiveTab] = useState("ai")
  const [uploadedImages, setUploadedImages] = useState([])
  const [imageError, setImageError] = useState('')
  const [imagePreview, setImagePreview] = useState()
  const [uploadedAiFile, setUploadedAiFile] = useState()

  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid","Gasoline"];
  const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
  const bodyTypes = [
    "SUV",
    "Sedan",
    "Hatchback",
    "Convertible",
    "Coupe",
    "Wagon",
    "Pickup",
  ];
  const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

  const router = useRouter()
  const {
    loading:processImagLoading,
    fn:processImageFn,
    data:processImageResult,
    error:processImageError,
  }=useFetch(processCarImageWithAI)
  const {
    data: addCarResult,
    loading: addcarLoading,
    fn: addCarFn
  } = useFetch(addCar)

  const carSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
      const year = parseInt(val);
      return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
    }, "Valid year required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
    featured: z.boolean().default(false),
  })

  useEffect(() => {

    if (addCarResult?.success) {
      toast.success("Car added successfullly")
      router.push("/admin/cars")
    }
  }, [addCarResult, addcarLoading])
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
    }
  })
  useEffect(() => {
    if (addCarResult?.success) {
      toast.success("Car Added successfully")
      router.push("/admin/cars")
    }
  }, [addCarResult])
  useEffect(()=>{
    if(processImageError)
    {
       toast.error("Error in process Image")
    }
  },[processImageError])

    useEffect(()=>{
          if(processImageResult?.success)
          {
           
            const carDetails=processImageResult.data
            console.log(carDetails,uploadedAiFile)
            setValue("make",carDetails.make)
            setValue("model",carDetails.model)
            setValue("year",carDetails.year.toString())
            setValue("color",carDetails.color)
            setValue("bodyType",carDetails.bodyType)
            setValue("fuelType",carDetails.fuelType)
            setValue("price",carDetails.price)
            setValue("mileage",carDetails.mileage)
            setValue("transmission",carDetails.transmission)
            setValue("description",carDetails.description)

            const reader=new FileReader()
            reader.onload = (e) => {
              setUploadedImages((prev)=>[...prev,e.target.result]); 
            };
            
            

            reader.readAsDataURL(uploadedAiFile)

            toast.success(`Successfully extracted Car Details`,{
              description:`Detected ${carDetails.year} ${carDetails.make} ${carDetails.model} with ${Math.round(carDetails.confidence)} confidence`
            })
            setActiveTab("manual")
          }
    },[processImageResult,uploadedAiFile])
  const onSubmit = async (data) => {
    console.log(uploadedImages)
    if (uploadedImages.length == 0) {
      setImageError("Pleasse Upload atleast one image")
      return;
    }
    const carData = {
      ...data,
      year: parseInt(data.year),
      price: parseInt(data.price),
      mileage: parseInt(data.mileage),
      seats: data.seats ? parseInt(data.seats) : null
    }
    console.log(uploadedImages)
    await addCarFn({ carData, uploadedImages })
  }

  const onMultiImagesDrop = (acceptedFiles) => {  
    console.log("images")
    const validImages = acceptedFiles.filter((img) => {
      if (img.size > 5 * 1024 * 1024) {
        toast.error(`${img.name} is exceed 5mb will be skipped`)
        return false;
      }

      return true
    })

    if (validImages.length === 0) return;

    const newImages = []
    validImages.forEach((file) => {
      const filereader = new FileReader()
      filereader.onload = (e) => {

        newImages.push(e.target.result)

        if (newImages.length === validImages.length) {
          setUploadedImages((prev) => [...prev, ...newImages])
          setImageError("")
          toast.success(`successfullly images uploaded ${validImages.length} images`)
        }

      }

      filereader.readAsDataURL(file)
    })

  }


  const processWithAI=async()=>{
    if(!uploadedAiFile)
    {
      toast.error("Please upload Image to extract details")
      return;
    }

    await  processImageFn(uploadedAiFile);

  }
    
  const onAiDrop = acceptedFiles => {
    const file = acceptedFiles[0]

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than  5MB")
        return;
      }
    }
    console.log(file)
    setUploadedAiFile(file)

    const reader = new FileReader()

    reader.onloadend = () => {
      setImagePreview(reader.result)
      toast.success("Image uploaded successfully")

    }

    reader.onerror = () => {
      setIsUploading(false)
      toast.error("Error in uploading the image")
    }
    reader.readAsDataURL(file)
  }
  const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } = useDropzone({
    onDrop: onAiDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"]
    },
    maxFiles: 1,
    multiple: false
  })

  const { getRootProps: getMultiImagesRootProps, getInputProps: getMultiInputProps } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"]
    },
    multiple: true
  })

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i != index))
  }

  return (
    <div>
      <Tabs defaultValue="ai"
        className="mt-6"
        value={activeTab}
        onValueChange={setActiveTab} >
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">AI Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>car Details</CardTitle>
              <CardDescription>Enter the Details of the Car</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data))}>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor="make">make</Label>
                    <Input
                      id="make"
                      {...register("make")}
                      placeholder="e.g Toyata"
                      className={errors.make ? "border-red-500" : ""}
                    />
                    {
                      errors.make && (
                        <p className='text-xs text-red-500'>
                          {errors.make.message}
                        </p>
                      )
                    }
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="model">model</Label>
                    <Input
                      id="model"
                      {...register("model")}
                      placeholder="e.g Carmy"
                      className={errors.model ? "border-red-500" : ""}
                    />
                    {
                      errors.model && (
                        <p className='text-xs text-red-500'>
                          {errors.model.message}
                        </p>
                      )
                    }
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      {...register("year")}
                      placeholder="e.g 2025"
                      className={errors.year ? "border-red-500" : ""}
                    />
                    {
                      errors.year && (
                        <p className='text-xs text-red-500'>
                          {errors.year.message}
                        </p>
                      )
                    }
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      {...register("price")}
                      placeholder="e.g Carmy"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {
                      errors.price && (
                        <p className='text-xs text-red-500'>
                          {errors.price.message}
                        </p>
                      )
                    }
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="mileage">Mileage ($)</Label>
                    <Input
                      id="mileage"
                      {...register("mileage")}
                      placeholder="e.g 1500"
                      className={errors.mileage ? "border-red-500" : ""}
                    />
                    {
                      errors.mileage && (
                        <p className='text-xs text-red-500'>
                          {errors.mileage.message}
                        </p>
                      )
                    }
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="color">Color ($)</Label>
                    <Input
                      id="color"
                      {...register("color")}
                      placeholder="e.g Blue"
                      className={errors.color ? "border-red-500" : ""}
                    />
                    {
                      errors.color && (
                        <p className='text-xs text-red-500'>
                          {errors.color.message}
                        </p>
                      )
                    }
                  </div>


                  <div className='space-y-2'>
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select
                      {...register("transmission")}
                      onValueChange={(value) => setValue("transmission", value)}
                      defaultValue={getValues("transmission")}
                      className="w-[180px]"
                    >
                      <SelectTrigger className={`${errors.transmission ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select Body Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((value) => {
                          return <SelectItem key={value} value={value}>{value}</SelectItem>
                        })}

                      </SelectContent>
                    </Select>

                    {
                      errors.transmission && (
                        <p className='text-xs text-red-500'>
                          {errors.transmission.message}
                        </p>
                      )
                    }
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="bodyType">Body Type</Label>
                    <Select
                      {...register("bodyType")}
                      onValueChange={(value) => setValue("bodyType", value)}
                      defaultValue={getValues("bodyType")}
                      className="w-[180px]"
                    >
                      <SelectTrigger className={`${errors.bodyType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select Body Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((value) => {
                          return <SelectItem key={value} value={value}>{value}</SelectItem>
                        })}

                      </SelectContent>
                    </Select>

                    {
                      errors.bodyType && (
                        <p className='text-xs text-red-500'>
                          {errors.bodyType.message}
                        </p>
                      )
                    }
                  </div>
                  <div className='space-y-2 w-full'>
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select
                      {...register("fuelType")}
                      onValueChange={(value) => setValue("fuelType", value)}
                      defaultValue={getValues("fuelType")}
                      className="w-full"
                    >
                      <SelectTrigger className={`${errors.fuelType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select Body Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((value) => {
                          return <SelectItem key={value} value={value}>{value}</SelectItem>
                        })}

                      </SelectContent>
                    </Select>

                    {
                      errors.fuelType && (
                        <p className='text-xs text-red-500'>
                          {errors.fuelType.message}
                        </p>
                      )
                    }
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="seats">Seats
                      <span className='text-xs text-gray-500'>Optional</span>
                    </Label>
                    <Input
                      id="seats"
                      {...register("seats")}
                      placeholder="e.g 5"
                      className={errors.seats ? "border-red-500" : ""}
                    />
                    {
                      errors.seats && (
                        <p className='text-xs text-red-500'>
                          {errors.seats.message}
                        </p>
                      )
                    }
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) => setValue("status", value)}
                      defaultValue={getValues("status")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>



                </div>
                <div className='space-y-2'>
                  <Label htmlFor="description">Description
                    <span className='text-xs text-gray-500'>Optional</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Write a few details about the car..."
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description.message}</p>
                  )}

                </div>
                <div className='flex items-start space-x-3 space-y-0 rounded-md  border p-4'>
                  <Checkbox
                    id="featured"
                    checked={watch("featured")}
                    onCheckedChange={(checked) => {
                      setValue("featured", checked)
                    }}
                  />

                  <div className='space-y-1 leading-none '>
                    <Label htmlFor="featured">Featured Products</Label>
                    <p className='text-sm text-gray-500'>Featured cars apperared at home page</p>
                  </div>
                </div>

                <div className='space-y-2 '>
                  <Label id="images" className="font-bold text-2xl">Images</Label>
                  {
                    imageError && <span className='text-red-400'>invalid Image type</span>
                  }
                  <div {...getMultiImagesRootProps()}
                    className={`border-2 border-dashed rounded-lg cursor-pointer p-6 text-center hover:bg-gray-50 transition ${imageError ? "border-red-500" : "border-gray-300"}`}>
                    <input {...getMultiInputProps()} />
                    <div className='flex flex-col items-center justify-center'>
                      <Upload className='h-12 w-12  text-gray-400 mb-2' />
                      <p className='text-gray-500 mb-2'>
                        Drag & drop a car image or click to select images
                      </p>
                      <p className='text-gray-400 text-sm'>
                        (JPG,PNG,webpmax 5 MB)
                      </p>
                    </div>
                  </div>
                  {imageError &&
                    (
                      <p className='text-red-500 text-xs'>{imageError}</p>
                    )}
                </div>

                {
                  uploadedImages.length > 0 && (
                    <div>
                      <h1>Uploaded Images :{uploadedImages.length}</h1>

                      <div className='flex gap-2  grou:'>
                        {uploadedImages.map((img, index) => {
                          return <div key={index} className='relative group' >
                            <Image
                              src={img}
                              alt={`carImage ${index + 1}`}
                              width={50}
                              height={50}
                              className='h-28 w-28 object-cover rounded-md'
                              priority
                            />
                            <Button
                              type="butto"
                              size={"icon"}
                              variant={"destructive"}
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            ><X className='w-3 h-3' /></Button>
                          </div>
                        })}
                      </div>
                    </div>
                  )
                }

                <div className="mt-6 cursor-pointer">
                  <Button type="submit" >
                    {addcarLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>

          </Card>

        </TabsContent>
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Powered Car Details extraction</CardTitle>
              <CardDescription>
                Upload an Image of  a car let AI extract the Details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='border-2 border-dashed rounded-lg  p-6  text-center'>
                  {imagePreview ?
                    <div className='flex flex-col items-center'>
                      <img src={imagePreview} alt=""
                        className='max-h-56 max-w-full object-contain mb-4' />

                      <div className='flex gap-2'>
                        <Button
                          variant={"outline"}
                          size={"sm"}
                          onClick={() => {
                            setUploadedAiFile(null)
                            setImagePreview(null)
                          }}> Remove</Button>
                        <Button
                          disabled={processImagLoading}
                          onClick={processWithAI}
                          size={"sm"}
                        > {processImagLoading ?
                          <>
                            <Loader2 className='animate-spin' /> Processing..
                          </> :
                          <>
                            <Camera className='w-4 h-4' />
                            Extract Details
                          </>
                          }</Button>
                      </div>
                    </div>
                    : <>
                      <div {...getAiRootProps()} className='cursor-pointer hover:gray-500 transition'>
                        <input {...getAiInputProps()} />
                        <div className='flex flex-col items-center'>
                          <Camera className='h-12 w-12  text-gray-400 mb-2' />
                          <p className='text-gray-500 text-sm'>
                            {
                              "Drag & drop a car image or click to select"
                            }
                          </p>


                          <p className='text-gray-400 text-sm'>
                            Support :JPG,PNG,Webp(max 5 MB)
                          </p>
                        </div>
                      </div></>}</div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">How it works</h3>
                  <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                    <li>Upload a clear image of the car</li>
                    <li>Click "Extract Details" to analyze with Gemini AI</li>
                    <li>Review the extracted information</li>
                    <li>Fill in any missing details manually</li>
                    <li>Add the car to your inventory</li>
                  </ol>
                </div>

                <div className="bg-amber-50 p-4 rounded-md">
                  <h3 className="font-medium text-amber-800 mb-1">
                    Tips for best results
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-700">
                    <li>• Use clear, well-lit images</li>
                    <li>• Try to capture the entire vehicle</li>
                    <li>• For difficult models, use multiple views</li>
                    <li>• Always verify AI-extracted information</li>
                  </ul>
                </div>
              </div>
            </CardContent>

          </Card>

        </TabsContent>
      </Tabs>

    </div>
  )
}

export default AddCarForm