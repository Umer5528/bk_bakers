import { Link } from "react-router-dom";
import { Truck, Store, Calendar, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatPKR } from "../../utils/priceCalculator";

const OrderCard = ({ order }) => (
  <Link
    to={`/orders/${order.orderNumber}`}
    className="card block p-4 transition-all duration-200 ease-soft-out hover:-translate-y-0.5 hover:shadow-lift"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-medium text-mauve-400">{order.orderNumber}</p>
        <p className="mt-0.5 truncate font-display text-lg font-semibold text-berry-500">
          {order.productNameSnapshot}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-mauve-500">
      <span className="flex items-center gap-1">
        {order.fulfillmentType === "delivery" ? (
          <Truck className="h-3.5 w-3.5" />
        ) : (
          <Store className="h-3.5 w-3.5" />
        )}
        {order.fulfillmentType === "delivery" ? "Delivery" : "Self-Pickup"}
      </span>
      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {new Date(order.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
      <span className="ml-auto flex items-center gap-1 font-semibold text-berry-600">
        {formatPKR(order.totalAmount)}
        <ChevronRight className="h-3.5 w-3.5 text-mauve-300" />
      </span>
    </div>
  </Link>
);

export default OrderCard;
