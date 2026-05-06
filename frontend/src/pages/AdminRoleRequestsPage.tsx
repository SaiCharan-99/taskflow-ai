import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { roleRequestsApi } from '@/api/roleRequests.api';
import { format } from 'date-fns';

interface RoleRequest {
  id: string;
  userId: string;
  requestedRole: string;
  status: string;
  reason: string;
  position: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    globalRole: string;
  };
}

export default function AdminRoleRequestsPage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.globalRole !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Load role requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await roleRequestsApi.getAll();
        setRequests(response.data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load role requests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [toast]);

  const handleReviewClick = (request: RoleRequest, status: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(request);
    setReviewStatus(status);
    setReviewNotes('');
    setIsReviewing(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest || !reviewStatus) return;

    try {
      await roleRequestsApi.reviewRequest(selectedRequest.id, {
        status: reviewStatus,
        reviewNotes,
      });

      toast({
        title: 'Success',
        description: `Role request ${reviewStatus === 'APPROVED' ? 'approved' : 'rejected'}.`,
      });

      // Update the request in the list
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: reviewStatus,
                reviewNotes,
                reviewedBy: user?.id || '',
              }
            : req
        )
      );

      setIsReviewing(false);
      setSelectedRequest(null);
      setReviewNotes('');
      setReviewStatus(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update role request',
        variant: 'destructive',
      });
    }
  };

  const pendingRequests = requests.filter((req) => req.status === 'PENDING');
  const processedRequests = requests.filter((req) => req.status !== 'PENDING');

  if (loading) {
    return <div className="p-8">Loading role requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Role Requests</h1>
          <p className="text-gray-600">
            Review and manage role requests from new users
          </p>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            Pending Requests ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No pending role requests
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-semibold">{request.user.name}</p>
                      <p className="text-sm text-gray-500">{request.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Position</p>
                      <p className="font-semibold">{request.position || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Requested Role</p>
                      <Badge variant="outline">{request.requestedRole}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Submitted</p>
                      <p className="text-sm">{format(new Date(request.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Why they want this role:</p>
                    <p className="text-sm text-gray-800">{request.reason}</p>
                  </div>

                  <div className="mt-4 flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => handleReviewClick(request, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleReviewClick(request, 'APPROVED')}
                    >
                      Approve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Processed Requests ({processedRequests.length})
            </h2>

            <div className="space-y-4">
              {processedRequests.map((request) => (
                <Card key={request.id} className="p-6 opacity-75">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-semibold">{request.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Requested Role</p>
                      <Badge variant="outline">{request.requestedRole}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <Badge
                        variant={request.status === 'APPROVED' ? 'default' : 'destructive'}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Processed</p>
                      <p className="text-sm">{format(new Date(request.updatedAt), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Notes</p>
                      <p className="text-sm">{request.reviewNotes || '-'}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewing} onOpenChange={setIsReviewing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewStatus === 'APPROVED' ? 'Approve' : 'Reject'} Role Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.user.name} - {selectedRequest?.requestedRole}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-1">Request Reason:</p>
              <p className="text-sm text-gray-800">{selectedRequest?.reason}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Admin Notes (Optional)
              </label>
              <Textarea
                placeholder="Add notes about this decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewing(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              variant={reviewStatus === 'APPROVED' ? 'default' : 'destructive'}
            >
              {reviewStatus === 'APPROVED' ? 'Approve' : 'Reject'} Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
