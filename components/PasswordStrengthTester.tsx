import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink } from 'lucide-react';

export function PasswordStrengthTester() {
  const features = [
    'Password complexity & entropy',
    'Dictionary attack resistance',
    'Time-to-crack estimates',
    'Common pattern detection'
  ];

  return (
    <Card className="bg-slate-800 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Test Your Password Strength
        </CardTitle>
        <p className="text-sm text-slate-300">
          Want to verify your password strength? Use Bitwarden's security analysis tool 
          to test entropy, resistance to attacks, and complexity.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-300">{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          variant="outline"
          className="w-full"
          asChild
        >
          <a 
            href="https://bitwarden.com/password-strength/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            Analyze with Bitwarden
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}