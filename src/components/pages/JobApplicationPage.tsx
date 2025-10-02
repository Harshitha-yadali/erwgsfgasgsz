import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Globe,
  ExternalLink,
  Sparkles,
  Send,
  Users,
  Calendar,
  Target,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { JobListing } from '../../types/jobs';

export const JobApplicationPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError('Job ID is missing');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('job_listings')
          .select('*')
          .eq('id', jobId)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Job not found');
          setLoading(false);
          return;
        }

        setJob(data as JobListing);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err instanceof Error ? err.message : 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleOptimizeResume = () => {
    if (!job) return;

    navigate('/resume-optimizer', {
      state: {
        jobId: job.id,
        jobDescription: job.description,
        roleTitle: job.role_title,
        companyName: job.company_name,
        fromJobApplication: true
      }
    });
  };

  const handleDirectApply = () => {
    if (!job) return;
    navigate(`/jobs/${job.id}/apply-form`);
  };

  const handleGoBack = () => {
    navigate('/jobs');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Job Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'This job listing is no longer available'}</p>
          <button
            onClick={handleGoBack}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const formatPackage = () => {
    if (!job.package_amount || !job.package_type) return null;

    const amount = job.package_amount;
    let formattedAmount = '';

    if (amount >= 100000) {
      formattedAmount = `${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      formattedAmount = `${(amount / 1000).toFixed(0)}K`;
    } else {
      formattedAmount = amount.toString();
    }

    return `₹${formattedAmount} ${job.package_type}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <button
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Jobs</span>
        </button>

        <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-200 dark:border-dark-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                {job.company_logo_url ? (
                  <div className="w-20 h-20 bg-white dark:bg-dark-200 rounded-xl border-2 border-gray-200 dark:border-dark-300 flex items-center justify-center p-3 shadow-lg">
                    <img
                      src={job.company_logo_url}
                      alt={`${job.company_name} logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">${job.company_name.charAt(0)}</div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {job.company_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {job.role_title}
                  </h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
                    {job.company_name}
                  </p>
                </div>
              </div>
              {formatPackage() && (
                <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-6 py-3 rounded-xl text-lg font-bold shadow-md">
                  {formatPackage()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium">{job.location_city || job.location_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="font-medium">{job.experience_required}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Work Type</p>
                  <p className="font-medium">{job.location_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posted</p>
                  <p className="font-medium">{new Date(job.posted_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">About the Company</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {job.company_description || `${job.company_name} is seeking talented individuals to join their team. This is an excellent opportunity to work with a dynamic organization and contribute to exciting projects.`}
            </p>

            {job.company_website && (
              <a
                href={job.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              >
                <Globe className="w-5 h-5" />
                <span>Visit Company Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Job Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.qualification && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Qualifications</h3>
                <p className="text-gray-700 dark:text-gray-300">{job.qualification}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Choose Your Application Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleOptimizeResume}
              className="group bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Optimize Resume with AI</h3>
              <p className="text-blue-100 mb-4 leading-relaxed">
                Get your resume optimized specifically for this job using our AI-powered ATS scoring system. Increase your chances of getting shortlisted.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">ATS score analysis and optimization</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Keyword matching for this specific job</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Download optimized resume PDF</span>
                </li>
              </ul>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Start Optimization</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </button>

            <button
              onClick={handleDirectApply}
              className="group bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Send className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Apply Directly</h3>
              <p className="text-green-100 mb-4 leading-relaxed">
                Skip the optimization process and apply directly with your existing resume. Quick and straightforward application.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Fast application process</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Upload your current resume</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Submit application immediately</span>
                </li>
              </ul>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Continue to Application</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                  <Send className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
