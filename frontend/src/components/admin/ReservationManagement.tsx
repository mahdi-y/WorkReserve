import React, { useEffect, useState } from 'react';
import { reservationService, type Reservation } from '../../services/reservationService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';

const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getAll();
      setReservations(data);
    } catch {
      toast({ title: "Error", description: "Failed to load reservations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await reservationService.cancel(id);
      loadReservations();
      toast({ title: "Reservation Cancelled" });
    } catch {
      toast({ title: "Error", description: "Failed to cancel reservation", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Reservations</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Slot</th>
                <th>User</th>
                <th>Team Size</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.slotId}</td>
                  <td>{r.userId}</td>
                  <td>{r.teamSize}</td>
                  <td>
                    <Badge variant={
                      r.status === 'CONFIRMED' ? 'default' :
                      r.status === 'CANCELLED' ? 'destructive' :
                      r.status === 'COMPLETED' ? 'secondary' : 'outline'
                    }>
                      {r.status}
                    </Badge>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    {r.status !== 'CANCELLED' && (
                      <Button size="sm" variant="outline" onClick={() => handleCancel(r.id)}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationManagement;