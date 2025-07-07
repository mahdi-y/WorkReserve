/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Users,
  Eye,
  Upload,
  X,
  ImageIcon,
  Link2
} from 'lucide-react';
import { roomService } from '../../services/roomService';
import api from '../../lib/api'; // Add this import

interface Room {
  id: number;
  name: string;
  type: 'HOT_DESK' | 'DEDICATED_DESK' | 'CONFERENCE_ROOM' | 'PRIVATE_OFFICE';
  capacity: number;
  pricePerHour: number;
  description?: string;
  imageUrls: string[];
}

const RoomForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isEdit = false 
}: { 
  formData: Partial<Room>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Room>>>;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}) => {
  const [imageInput, setImageInput] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addImageUrl = () => {
    if (imageInput.trim()) {
      const currentImages = formData.imageUrls || [];
      setFormData(prev => ({ 
        ...prev, 
        imageUrls: [...currentImages, imageInput.trim()] 
      }));
      setImageInput('');
    }
  };

  const removeImageUrl = (index: number) => {
    const currentImages = formData.imageUrls || [];
    setFormData(prev => ({ 
      ...prev, 
      imageUrls: currentImages.filter((_, i) => i !== index) 
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImageUrl();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }
        uploadFormData.append('files', file);
      });

      const response = await api.post('/rooms/images', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrls = response.data;
      const currentImages = formData.imageUrls || [];
      
      setFormData(prev => ({ 
        ...prev, 
        imageUrls: [...currentImages, ...uploadedUrls] 
      }));

      toast({
        title: "Upload Successful",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || error.message || "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <Label htmlFor="name">Room Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter room name"
        />
      </div>
      
      <div>
        <Label htmlFor="type">Room Type *</Label>
        <Select value={formData.type || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Room['type'] }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select room type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HOT_DESK">Hot Desk</SelectItem>
            <SelectItem value="DEDICATED_DESK">Dedicated Desk</SelectItem>
            <SelectItem value="CONFERENCE_ROOM">Conference Room</SelectItem>
            <SelectItem value="PRIVATE_OFFICE">Private Office</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
            placeholder="Number of people"
          />
        </div>
        
        <div>
          <Label htmlFor="price">Price per Hour *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.pricePerHour || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter room description"
          rows={3}
        />
      </div>

      {/* Image Management Section */}
      <div className="space-y-3">
        <Label>Room Images</Label>
        
        {/* Upload Mode Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <Button
            type="button"
            variant={uploadMode === 'url' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setUploadMode('url')}
            className="flex-1"
          >
            <Link2 className="w-4 h-4 mr-1" />
            URL
          </Button>
          <Button
            type="button"
            variant={uploadMode === 'file' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setUploadMode('file')}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
        </div>

        {/* URL Input Mode */}
        {uploadMode === 'url' && (
          <div className="flex gap-2">
            <Input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter image URL and press Enter"
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addImageUrl}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* File Upload Mode */}
        {uploadMode === 'file' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              onClick={triggerFileUpload}
              variant="outline"
              className="w-full"
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose Images'}
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              Select multiple images (max 5MB each, JPG, PNG, GIF)
            </p>
          </div>
        )}

        {formData.imageUrls && formData.imageUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Added Images ({formData.imageUrls.length}):</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm truncate flex-1" title={url}>
                    {url}
                  </span>
                  <Button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit} disabled={isUploading}>
          {isEdit ? 'Update' : 'Create'} Room
        </Button>
      </div>
    </div>
  );
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Room>>({});
  const { toast } = useToast();

  useEffect(() => {
    roomService.getAllRooms()
      .then(setRooms)
      .catch(() => toast({ title: "Error", description: "Failed to fetch rooms", variant: "destructive" }));
  }, []);

  useEffect(() => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(room => room.type === typeFilter);
    }

    setFilteredRooms(filtered);
  }, [rooms, searchTerm, typeFilter]);

  const formatRoomType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'HOT_DESK': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'DEDICATED_DESK': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CONFERENCE_ROOM': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'PRIVATE_OFFICE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleCreateRoom = async () => {
    if (!formData.name || !formData.type || !formData.capacity || !formData.pricePerHour) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newRoom = await roomService.createRoom({
        name: formData.name!,
        type: formData.type!,
        capacity: formData.capacity!,
        pricePerHour: formData.pricePerHour!,
        description: formData.description || '',
        imageUrls: formData.imageUrls || [],
      });
      setRooms(prev => [...prev, newRoom]);
      setFormData({});
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Room Created",
        description: `${newRoom.name} has been added successfully.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to create room", variant: "destructive" });
    }
  };

  const handleEditRoom = async () => {
    if (!selectedRoom || !formData.name || !formData.type || !formData.capacity || !formData.pricePerHour) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedRoom) return;
    try {
      const updatedRoom = await roomService.updateRoom(selectedRoom.id, {
        name: formData.name!,
        type: formData.type!,
        capacity: formData.capacity!,
        pricePerHour: formData.pricePerHour!,
        description: formData.description || '',
        imageUrls: formData.imageUrls || [],
      });
      setRooms(prev => prev.map(room => room.id === selectedRoom.id ? updatedRoom : room));
      setFormData({});
      setSelectedRoom(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Room Updated",
        description: `${updatedRoom.name} has been updated successfully.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to update room", variant: "destructive" });
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    try {
      await roomService.deleteRoom(roomId);
      setRooms(prev => prev.filter(room => room.id !== roomId));
      
      toast({
        title: "Room Deleted",
        description: `Room has been removed from the system.`,
        variant: "destructive"
      });
    } catch {
      toast({ title: "Error", description: "Failed to delete room", variant: "destructive" });
    }
  };

  const openEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setFormData({ ...room });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({ imageUrls: [] });
    setIsCreateDialogOpen(true);
  };

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Room Management
              </CardTitle>
              <CardDescription>Manage workspace rooms and their configurations</CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search rooms by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="HOT_DESK">Hot Desk</SelectItem>
                <SelectItem value="DEDICATED_DESK">Dedicated Desk</SelectItem>
                <SelectItem value="CONFERENCE_ROOM">Conference Room</SelectItem>
                <SelectItem value="PRIVATE_OFFICE">Private Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
              <div className="text-sm text-blue-600">Total Rooms</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{rooms.filter(r => r.type === 'CONFERENCE_ROOM').length}</div>
              <div className="text-sm text-green-600">Conference Rooms</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{rooms.filter(r => r.type.includes('DESK')).length}</div>
              <div className="text-sm text-purple-600">Desk Spaces</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{rooms.reduce((sum, room) => sum + room.capacity, 0)}</div>
              <div className="text-sm text-orange-600">Total Capacity</div>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Price/Hour</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div className="font-medium">{room.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(room.type)}>
                        {formatRoomType(room.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        {room.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {room.pricePerHour} TND
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        {room.imageUrls?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {room.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(room)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Room</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {room.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No rooms found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Room</DialogTitle>
            <DialogDescription>Add a new room to the workspace</DialogDescription>
          </DialogHeader>
          <RoomForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateRoom} 
            onCancel={() => setIsCreateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>Update room information</DialogDescription>
          </DialogHeader>
          <RoomForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditRoom} 
            onCancel={() => setIsEditDialogOpen(false)}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default RoomManagement;