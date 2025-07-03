import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Sparkles, Clock, Target, BookOpen, ChevronRight, Loader2 } from "lucide-react";

const aiCurriculumSchema = z.object({
  childName: z.string().min(1, "Child name is required"),
  grade: z.string().min(1, "Grade level is required"),
  subject: z.string().min(1, "Subject is required"),
  learningStyle: z.string().optional(),
  interests: z.string().optional(),
  stateStandards: z.string().optional(),
  duration: z.enum(["semester", "year", "quarter"]),
  focusAreas: z.string().optional(),
});

export default function AICurriculumBuilder() {
  const { toast } = useToast();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [generatedCurriculum, setGeneratedCurriculum] = useState<any>(null);

  const form = useForm<z.infer<typeof aiCurriculumSchema>>({
    resolver: zodResolver(aiCurriculumSchema),
    defaultValues: {
      childName: "",
      grade: "",
      subject: "",
      learningStyle: "",
      interests: "",
      stateStandards: "",
      duration: "year",
      focusAreas: "",
    },
  });

  const generateCurriculumMutation = useMutation({
    mutationFn: async (data: z.infer<typeof aiCurriculumSchema>) => {
      const requestData = {
        ...data,
        interests: data.interests ? data.interests.split(',').map(s => s.trim()) : [],
        focusAreas: data.focusAreas ? data.focusAreas.split(',').map(s => s.trim()) : [],
      };
      
      const response = await apiRequest("POST", "/api/ai/generate-curriculum", requestData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      setGeneratedCurriculum(data);
      toast({
        title: "Success",
        description: "AI curriculum generated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate curriculum. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof aiCurriculumSchema>) => {
    generateCurriculumMutation.mutate(data);
  };

  return (
    <div>
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    AI Curriculum Builder
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    Generate a complete, standards-aligned curriculum tailored to your child's learning style and interests.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-neutral-500">
                    <div className="flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Powered
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      2-3 minutes
                    </div>
                    <div className="flex items-center">
                      <Target className="h-3 w-3 mr-1" />
                      Standards-Aligned
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <span>AI Curriculum Builder</span>
            </DialogTitle>
          </DialogHeader>

          {!generatedCurriculum ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="childName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Emma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="K">Kindergarten</SelectItem>
                            <SelectItem value="1st">1st Grade</SelectItem>
                            <SelectItem value="2nd">2nd Grade</SelectItem>
                            <SelectItem value="3rd">3rd Grade</SelectItem>
                            <SelectItem value="4th">4th Grade</SelectItem>
                            <SelectItem value="5th">5th Grade</SelectItem>
                            <SelectItem value="6th">6th Grade</SelectItem>
                            <SelectItem value="7th">7th Grade</SelectItem>
                            <SelectItem value="8th">8th Grade</SelectItem>
                            <SelectItem value="9th">9th Grade</SelectItem>
                            <SelectItem value="10th">10th Grade</SelectItem>
                            <SelectItem value="11th">11th Grade</SelectItem>
                            <SelectItem value="12th">12th Grade</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="English Language Arts">English Language Arts</SelectItem>
                            <SelectItem value="History">History</SelectItem>
                            <SelectItem value="Geography">Geography</SelectItem>
                            <SelectItem value="Art">Art</SelectItem>
                            <SelectItem value="Music">Music</SelectItem>
                            <SelectItem value="Physical Education">Physical Education</SelectItem>
                            <SelectItem value="Foreign Language">Foreign Language</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Curriculum Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="quarter">Quarter (9 weeks)</SelectItem>
                            <SelectItem value="semester">Semester (18 weeks)</SelectItem>
                            <SelectItem value="year">Full Year (36 weeks)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="learningStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Style (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select learning style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Visual">Visual Learner</SelectItem>
                          <SelectItem value="Auditory">Auditory Learner</SelectItem>
                          <SelectItem value="Kinesthetic">Hands-on/Kinesthetic</SelectItem>
                          <SelectItem value="Reading">Reading/Writing</SelectItem>
                          <SelectItem value="Mixed">Mixed Approach</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child's Interests (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="dinosaurs, space, art, sports (comma-separated)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stateStandards"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State Standards (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state standards" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Common Core">Common Core</SelectItem>
                          <SelectItem value="Texas TEKS">Texas TEKS</SelectItem>
                          <SelectItem value="California Standards">California Standards</SelectItem>
                          <SelectItem value="Florida Standards">Florida Standards</SelectItem>
                          <SelectItem value="New York Standards">New York Standards</SelectItem>
                          <SelectItem value="Other">Other State Standards</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="focusAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus Areas (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="problem solving, critical thinking, creativity (comma-separated)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsBuilderOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={generateCurriculumMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {generateCurriculumMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Generate Curriculum
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Curriculum Generated Successfully!</h3>
                </div>
                <p className="text-sm text-green-700">
                  Your personalized curriculum has been created and saved to your account.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{generatedCurriculum.curriculum.title}</h3>
                <p className="text-neutral-600 mb-4">{generatedCurriculum.curriculum.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Learning Objectives</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      {generatedCurriculum.curriculum.objectives.slice(0, 3).map((obj: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <Target className="h-3 w-3 mr-2 mt-1 text-primary" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">What's Included</h4>
                    <div className="space-y-2">
                      <Badge variant="outline" className="mr-2">
                        {generatedCurriculum.generatedContent.lessons.length} Lessons
                      </Badge>
                      <Badge variant="outline" className="mr-2">
                        Standards-Aligned
                      </Badge>
                      <Badge variant="outline" className="mr-2">
                        Assessment Methods
                      </Badge>
                      <Badge variant="outline">
                        Resource Lists
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    setGeneratedCurriculum(null);
                    form.reset();
                  }}
                  variant="outline"
                >
                  Generate Another
                </Button>
                <Button 
                  onClick={() => setIsBuilderOpen(false)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View in Curriculum
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}