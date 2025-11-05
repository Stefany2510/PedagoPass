import ReceiptClient from './receipt-client';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="container-max py-10">
      <div className="max-w-3xl mx-auto">
        <ReceiptClient id={params.id} />
      </div>
    </div>
  );
}
