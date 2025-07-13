import Layout from '@/components/layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Home, RefreshCcw } from 'lucide-react';
import type { NextPage } from 'next';
import Link from 'next/link';

const errors = {
  500: {
    title: 'Internal Server Error',
    description: 'We encountered an internal error. Our team has been notified.'
  },
  403: {
    title: 'Access Forbidden',
    description: "You don't have permission to access this resource."
  },
  400: {
    title: 'Bad Request',
    description: 'The request could not be understood by the server due to malformed syntax.'
  },
  401: {
    title: 'Unauthorized',
    description: 'You must authenticate to access this resource.'
  }
};

const Error: NextPage<{ statusCode?: number }> = ({ statusCode }) => {
  return (
    <Layout title={`Error ${statusCode}`} className="flex flex-col items-center justify-center">
      <h1 className="text-center text-5xl font-extrabold">
        {errors[statusCode as keyof typeof errors]?.title || 'Unknown Error'}
      </h1>
      <p className="mt-4 text-center text-lg">
        {errors[statusCode as keyof typeof errors]?.description || 'An unexpected error occurred.'}
      </p>
      <div className="mt-8 flex justify-center gap-6">
        <Link className={buttonVariants()} href="/">
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Link>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </Layout>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
