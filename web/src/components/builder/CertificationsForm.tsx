import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function CertificationsForm() {
  const { currentResume, addCertification, updateCertification, deleteCertification } = useResumeStore();

  if (!currentResume) return null;

  return (
    <div className="space-y-4">
      {currentResume.certifications.map((cert, index) => (
        <Card key={cert.id}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-lg">Certification {index + 1}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteCertification(cert.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certification Name</Label>
                <Input
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                  placeholder="AWS Solutions Architect"
                />
              </div>
              <div className="space-y-2">
                <Label>Issuing Organization</Label>
                <Input
                  value={cert.issuer}
                  onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                  placeholder="Amazon Web Services"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="month"
                  value={cert.issueDate}
                  onChange={(e) => updateCertification(cert.id, { issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="month"
                  value={cert.expiryDate}
                  onChange={(e) => updateCertification(cert.id, { expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credential ID (Optional)</Label>
                <Input
                  value={cert.credentialId}
                  onChange={(e) => updateCertification(cert.id, { credentialId: e.target.value })}
                  placeholder="ABC123XYZ"
                />
              </div>
              <div className="space-y-2">
                <Label>Credential URL (Optional)</Label>
                <Input
                  value={cert.url}
                  onChange={(e) => updateCertification(cert.id, { url: e.target.value })}
                  placeholder="https://verify.cert.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addCertification} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Certification
      </Button>
    </div>
  );
}
