
import PageContainer from "@/app/components/container/PageContainer";
import Categories from "@/app/components/shared/Categories";


export default function CustomersPage() {

 
  return (
    <PageContainer title="Blogs Page" description="This is Blogs page">
      <Categories/>
    </PageContainer>
  );
};

export const metadata = { title: "Blogs page" };
