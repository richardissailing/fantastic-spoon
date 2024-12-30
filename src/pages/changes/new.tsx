"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X, File, UploadCloud, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ChangeFormData = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  plannedStart: string;
  plannedEnd: string;
};

type FileWithPreview = File & {
  preview?: string;
  id: string;
};

export default function NewChangePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [files, setFiles] = React.useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const defaultStart = new Date();
  const defaultEnd = new Date(defaultStart.getTime() + 24 * 60 * 60 * 1000);

  const formatDateTimeLocal = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const { 
    register, 
    handleSubmit, 
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ChangeFormData>({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      type: "FEATURE",
      impact: "MEDIUM",
      plannedStart: formatDateTimeLocal(defaultStart),
      plannedEnd: formatDateTimeLocal(defaultEnd),
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: FileWithPreview[] = Array.from(selectedFiles).map(file => ({
      ...file,
      id: Math.random().toString(36).substring(7),
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const mockUploadToS3 = async (files: File[]) => {
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUploading(false);
    return files.map(file => ({
      // url: URL.createObjectURL(file),
      filename: file.name
    }));
  };

  const onSubmit = async (data: ChangeFormData) => {
    try {
      setIsUploading(true);
      
      const uploadedFiles = await mockUploadToS3(files);
      
      const formattedData = {
        ...data,
        plannedStart: new Date(data.plannedStart).toISOString(),
        plannedEnd: new Date(data.plannedEnd).toISOString(),
        documents: uploadedFiles,
      };

      const response = await fetch("/api/changes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Failed to create change");
      }

      toast({
        title: "Success",
        description: "Change request created successfully",
      });
      
      router.push("/changes");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create change request",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Change Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder="Enter change request title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register("description", { required: "Description is required" })}
                placeholder="Detailed description of the change"
                className="min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                defaultValue="FEATURE"
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEATURE">Feature</SelectItem>
                  <SelectItem value="BUG">Bug Fix</SelectItem>
                  <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                  <SelectItem value="SECURITY">Security</SelectItem>
                  <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Impact</label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(value) => setValue('impact', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Planned Start Date</label>
              <Input
                type="datetime-local"
                {...register('plannedStart', { required: 'Start date is required' })}
              />
              {errors.plannedStart && (
                <p className="text-sm text-red-500">{errors.plannedStart.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Planned End Date</label>
              <Input
                type="datetime-local"
                {...register('plannedEnd', { required: 'End date is required' })}
              />
              {errors.plannedEnd && (
                <p className="text-sm text-red-500">{errors.plannedEnd.message}</p>
              )}
            </div>
          </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Documents</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer text-primary hover:text-primary/80">
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="text-muted-foreground">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, TXT, JPG, JPEG or PNG up to 10MB each
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Selected Files:</h4>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || isUploading}
            className="min-w-[140px]"
          >
            {(isSubmitting || isUploading) ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </span>
            ) : (
              "Create Change Request"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}