
import PageContainer from "@/app/components/container/PageContainer";
import Blogs from "@/app/components/shared/Blogs";


export default function CustomersPage() {

 
  return (
    <PageContainer title="Blogs Page" description="This is Blogs page">
      <Blogs/>
    </PageContainer>
  );
};

export const metadata = { title: "Blogs page" };
