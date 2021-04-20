class Instance:
    def __init__(self, name: str) -> None:
        self.name: str = name

class InstanceList:
    def __init__(self) -> None:
        self.instances: list[Instance] = []

    def instance_exists(self, instance: Instance) -> bool:
        return self.get_instance(instance.name) is not None

    def get_instance(self, instance_name) -> Instance:
        for instance in self.instances:
            if instance_name == instance.name:
                return instance

    def add(self, instance: Instance):
        if not self.instance_exists(instance):
            self.instances.append(instance)

    def remove(self, instance: Instance) -> None:
        existing_instance = self.get_instance(instance.name)
        if existing_instance is not None:
            self.instances.remove(existing_instance)

    def is_empty(self) -> bool:
        if self.length() == 0:
            return True
        return False

    def length(self) -> int:
        return len(self.instances)

    def __getitem__(self, key) -> Instance:
        return self.instances[key]

    def __len__(self):
        return self.instances.len()