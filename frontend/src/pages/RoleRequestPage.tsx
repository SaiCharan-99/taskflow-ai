import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { roleRequestsApi } from '@/api/roleRequests.api';

const roleRequestSchema = z.object({
  requestedRole: z.enum(['MANAGER', 'MEMBER'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  position: z.string().min(2, 'Position is required').max(100),
  reason: z.string().min(20, 'Please provide at least 20 characters explaining why you need this role').max(500),
});

type RoleRequestFormData = z.infer<typeof roleRequestSchema>;

export default function RoleRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRequest, setHasRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const form = useForm<RoleRequestFormData>({
    resolver: zodResolver(roleRequestSchema),
    defaultValues: {
      requestedRole: 'MEMBER',
      position: '',
      reason: '',
    },
  });

  // Check if user already has a role request
  useEffect(() => {
    const checkRequest = async () => {
      try {
        const response = await roleRequestsApi.getMyRequest();
        if (response.data) {
          setHasRequest(true);
          setRequestStatus(response.data.status);
        }
      } catch (error) {
        // No existing request
        setHasRequest(false);
      }
    };

    checkRequest();
  }, []);

  const onSubmit = async (data: RoleRequestFormData) => {
    setIsSubmitting(true);
    try {
      await roleRequestsApi.createRequest(data);
      toast({
        title: 'Role request submitted',
        description: 'Your request has been submitted to admins for review.',
      });
      setHasRequest(true);
      setRequestStatus('PENDING');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit role request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (hasRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <div className="p-8">
            <div className="text-center">
              <div className="mb-4 text-4xl">📋</div>
              <h1 className="text-2xl font-bold mb-2">Role Request {requestStatus === 'APPROVED' ? 'Approved! ✅' : 'Pending Review'}</h1>
              <p className="text-gray-600 mb-6">
                {requestStatus === 'APPROVED'
                  ? 'Your role has been updated. You now have access to all features.'
                  : 'Your role request is currently pending admin review. We will notify you once it has been processed.'}
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">Request a Role</h1>
            <p className="text-gray-600 mb-8">
              Tell us about yourself and what role you'd like to take on in TaskFlow.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position / Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Full Stack Developer, Project Manager" {...field} />
                      </FormControl>
                      <FormDescription>
                        What is your role or position?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestedRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MEMBER">Team Member</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the role you want to request
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want this role?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain your experience and why you want to take on this role..."
                          className="resize-none"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 20 characters. This helps admins understand your background.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Card>

        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">Role Descriptions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">👤 Team Member</h4>
              <p className="text-sm text-gray-600">
                Execute assigned tasks, update task status, and collaborate with the team.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">👥 Manager</h4>
              <p className="text-sm text-gray-600">
                Create projects, manage team members, assign tasks, and track project progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
