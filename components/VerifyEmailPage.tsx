import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '../services/authService';

interface VerifyEmailPageProps {
  token?: string;
  userEmail?: string;
  onVerificationSuccess: () => void;
  onNavigateToDashboard: () => void;
}

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({
  token,
  userEmail,
  onVerificationSuccess,
  onNavigateToDashboard
}) => {
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      await verifyEmail(token);
      setSuccess(true);
      setTimeout(() => {
        onVerificationSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setError('');
    setResentSuccess(false);

    try {
      await resendVerificationEmail();
      setResentSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-gray-800/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-gray-800/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-4">
            <span className="text-2xl font-bold text-black">V3</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Verification</h1>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          {loading ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Verifying Your Email...</h3>
                <p className="text-gray-400 text-sm">Please wait while we verify your email address.</p>
              </div>
            </div>
          ) : success ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Email Verified!</h3>
                <p className="text-gray-300 text-sm">
                  Your email has been successfully verified. Redirecting to dashboard...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Verification Failed</h3>
                <p className="text-gray-300 text-sm">{error}</p>
                <p className="text-gray-400 text-xs mt-4">
                  The verification link may have expired or already been used.
                </p>
              </div>
              {userEmail && (
                <div className="pt-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="w-full py-3 px-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={20} />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                  {resentSuccess && (
                    <p className="mt-3 text-sm text-green-400 flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      Verification email sent!
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={onNavigateToDashboard}
                className="w-full py-2 px-4 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Skip for now
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full">
                <Mail className="text-blue-400" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Check Your Email</h3>
                <p className="text-gray-300 text-sm">
                  We've sent a verification link to <strong>{userEmail}</strong>
                </p>
                <p className="text-gray-400 text-xs mt-4">
                  Click the link in the email to verify your account. The link will expire in 24 hours.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full py-3 px-4 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Resend Email
                    </>
                  )}
                </button>
                {resentSuccess && (
                  <p className="text-sm text-green-400 flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Verification email sent!
                  </p>
                )}
                <button
                  onClick={onNavigateToDashboard}
                  className="w-full py-2 px-4 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Vib3 Idea Sales. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
