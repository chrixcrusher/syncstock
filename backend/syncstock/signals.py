from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from .models import InventoryItem, StockAdjustment, StockTransfer, TotalCurrentInventory

# InventoryItem signals

@receiver(pre_save, sender=InventoryItem)
def handle_inventory_item_pre_save(sender, instance, **kwargs):
    if instance.pk:
        old_instance = InventoryItem.objects.get(pk=instance.pk)
        try:
            old_total_inventory = TotalCurrentInventory.objects.get(
                company=old_instance.company,
                item_name=old_instance.item_name,
                product_code=old_instance.product_code,
                sku=old_instance.sku,
                location=old_instance.location
            )
            old_total_inventory.total_current_inventory -= old_instance.quantity
            old_total_inventory.total_current_inventory = max(0, old_total_inventory.total_current_inventory)
            old_total_inventory.save()
        except TotalCurrentInventory.DoesNotExist:
            pass

@receiver(post_save, sender=InventoryItem)
def update_total_current_inventory(sender, instance, created, **kwargs):
    # Check if the record exists
    total_inventory, created = TotalCurrentInventory.objects.get_or_create(
        company=instance.company,
        item_name=instance.item_name,
        product_code=instance.product_code,
        sku=instance.sku,
        location=instance.location,
        category=instance.category,
        defaults={'total_current_inventory': 0}
    )
    
    if not created:
        total_inventory.total_current_inventory += instance.quantity
    else:
        total_inventory.total_current_inventory = instance.quantity
    
    total_inventory.save()

@receiver(post_delete, sender=InventoryItem)
def handle_inventory_item_delete(sender, instance, **kwargs):
    try:
        total_inventory = TotalCurrentInventory.objects.get(
            company=instance.company,
            item_name=instance.item_name,
            product_code=instance.product_code,
            sku=instance.sku,
            location=instance.location,
            category=instance.category
        )
        total_inventory.total_current_inventory -= instance.quantity
        total_inventory.total_current_inventory = max(0, total_inventory.total_current_inventory)
        total_inventory.save()
    except TotalCurrentInventory.DoesNotExist:
        pass

# StockAdjustment signals

@receiver(pre_save, sender=StockAdjustment)
def handle_stock_adjustment_pre_save(sender, instance, **kwargs):
    if instance.pk:
        old_instance = StockAdjustment.objects.get(pk=instance.pk)
        try:
            old_total_inventory = TotalCurrentInventory.objects.get(
                company=old_instance.company,
                item_name=old_instance.item.item_name,
                product_code=old_instance.item.product_code,
                sku=old_instance.item.sku,
                location=old_instance.location,
                category=old_instance.item.category
            )
            old_total_inventory.total_current_inventory += old_instance.quantity
            old_total_inventory.save()
        except TotalCurrentInventory.DoesNotExist:
            pass

    # New validation for current stock level
    try:
        total_inventory = TotalCurrentInventory.objects.get(
            company=instance.company,
            item_name=instance.item.item_name,
            product_code=instance.item.product_code,
            sku=instance.item.sku,
            location=instance.location,
            category=instance.item.category
        )
        if total_inventory.total_current_inventory < instance.quantity:
            raise ValidationError("Insufficient stock, cannot proceed with the adjustment.")
    except TotalCurrentInventory.DoesNotExist:
        raise ValidationError("Insufficient stock, cannot proceed with the adjustment.")

@receiver(post_save, sender=StockAdjustment)
def update_total_current_inventory_after_adjustment(sender, instance, created, **kwargs):
    total_inventory, created = TotalCurrentInventory.objects.get_or_create(
        company=instance.company,
        item_name=instance.item.item_name,
        product_code=instance.item.product_code,
        sku=instance.sku,
        location=instance.location,
        category=instance.item.category,
        defaults={'total_current_inventory': 0}
    )

    if not created:
        total_inventory.total_current_inventory -= instance.quantity
        total_inventory.total_current_inventory = max(0, total_inventory.total_current_inventory)
    else:
        total_inventory.total_current_inventory = max(0, -instance.quantity)

    total_inventory.save()

@receiver(post_delete, sender=StockAdjustment)
def handle_stock_adjustment_delete(sender, instance, **kwargs):
    try:
        total_inventory = TotalCurrentInventory.objects.get(
            company=instance.company,
            item_name=instance.item.item_name,
            product_code=instance.item.product_code,
            sku=instance.sku,
            location=instance.location,
            category=instance.item.category
        )
        total_inventory.total_current_inventory += instance.quantity
        total_inventory.save()
    except TotalCurrentInventory.DoesNotExist:
        pass

# StockTransfer signals

@receiver(pre_save, sender=StockTransfer)
def pre_save_stock_transfer(sender, instance, **kwargs):
    if instance.pk:  # Instance already exists, so it's an update
        previous = StockTransfer.objects.get(pk=instance.pk)
        
        # Reverse the effects of the previous transfer
        if previous.quantity != instance.quantity or previous.from_location != instance.from_location:
            # Adjust TotalCurrentInventory for the previous 'from_location'
            try:
                total_inventory = TotalCurrentInventory.objects.get(
                    company=previous.company,
                    item_name=previous.item.item_name,
                    product_code=previous.item.product_code,
                    sku=previous.item.sku,
                    location=previous.from_location,
                    category=previous.item.category,
                )
                total_inventory.total_current_inventory += previous.quantity
                total_inventory.save()
            except TotalCurrentInventory.DoesNotExist:
                pass  # In case the record was manually altered or deleted

            # Adjust TotalCurrentInventory for the previous 'to_location'
            try:
                total_inventory = TotalCurrentInventory.objects.get(
                    company=previous.company,
                    item_name=previous.item.item_name,
                    product_code=previous.item.product_code,
                    sku=previous.item.sku,
                    location=previous.to_location,
                    category=previous.item.category,
                )
                total_inventory.total_current_inventory -= previous.quantity
                total_inventory.total_current_inventory = max(0, total_inventory.total_current_inventory)
                total_inventory.save()
            except TotalCurrentInventory.DoesNotExist:
                pass  # In case the record was manually altered or deleted

    # New validation for stock level at 'from_location'
    try:
        total_inventory = TotalCurrentInventory.objects.get(
            company=instance.company,
            item_name=instance.item.item_name,
            product_code=instance.item.product_code,
            sku=instance.item.sku,
            location=instance.from_location,
            category=instance.item.category
        )
        if total_inventory.total_current_inventory < instance.quantity:
            raise ValidationError("Insufficient stock, cannot proceed with the transfer.")
    except TotalCurrentInventory.DoesNotExist:
        raise ValidationError("Insufficient stock, cannot proceed with the transfer.")

@receiver(post_save, sender=StockTransfer)
def post_save_stock_transfer(sender, instance, created, **kwargs):
    # Adjust TotalCurrentInventory for the new 'from_location'
    total_inventory, created = TotalCurrentInventory.objects.get_or_create(
        company=instance.company,
        item_name=instance.item.item_name,
        product_code=instance.item.product_code,
        sku=instance.item.sku,
        location=instance.from_location,
        category=instance.item.category,
        defaults={'total_current_inventory': 0},
    )
    if not created:
        total_inventory.total_current_inventory -= instance.quantity
        total_inventory.total_current_inventory = max(0, total_inventory.total_current_inventory)
    else:
        total_inventory.total_current_inventory = max(0, -instance.quantity)
    total_inventory.save()

    # Adjust TotalCurrentInventory for the new 'to_location'
    total_inventory, created = TotalCurrentInventory.objects.get_or_create(
        company=instance.company,
        item_name=instance.item.item_name,
        product_code=instance.item.product_code,
        sku=instance.item.sku,
        location=instance.to_location,
        category=instance.item.category,
        defaults={'total_current_inventory': instance.quantity},
    )
    if not created:
        total_inventory.total_current_inventory += instance.quantity
    total_inventory.save()

@receiver(post_delete, sender=StockTransfer)
def post_delete_stock_transfer(sender, instance, **kwargs):
    # Revert TotalCurrentInventory for the deleted 'from_location'
    try:
        total_inventory = TotalCurrentInventory.objects.get(
            company=instance.company,
            item_name=instance.item.item_name,
            product_code=instance.item.product_code,
            sku=instance.item.sku,
            location=instance.from_location,
            category=instance.item.category,
        )
        total_inventory.total_current_inventory += instance.quantity
        total_inventory.save()
    except TotalCurrentInventory.DoesNotExist:
        pass

    # Revert TotalCurrentInventory for the deleted 'to_location'
    try:
        total_inventory = TotalCurrentInventory.objects.get(
            company=instance.company,
            item_name=instance.item.item_name,
            product_code=instance.item.product_code,
            sku=instance.item.sku,
            location=instance.to_location,
            category=instance.item.category,
        )
        total_inventory.total_current_inventory -= instance.quantity
        total_inventory.total_current_inventory = max(0, total_inventory.total_current_inventory)
        total_inventory.save()
    except TotalCurrentInventory.DoesNotExist:
        pass
